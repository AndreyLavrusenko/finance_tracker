import { CreateTransactionsDto } from './dto/create-transactions.dto';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { PatchTransactionsDto } from './dto/patch-transactions.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { StatisticTransactionsDto } from './dto/statistic-transactions.dto';
import { TransactionType } from '../common';

@Injectable()
export class TransactionsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: string, dto: CreateTransactionsDto) {
        const account = await this.findUserAccount(userId, dto.accountId);

        const category = await this.findUserCategory(userId, dto.categoryId);

        if (category.type !== dto.type) {
            throw new BadRequestException(
                'Тип транзакции не соответствует типу категории',
            );
        }

        return await this.prismaService.$transaction(async (tx) => {
            const transaction = await tx.transactions.create({
                data: {
                    account_id: BigInt(account.id),
                    category_id: BigInt(category.id),
                    amount: dto.amount,
                    type: dto.type,
                    description: dto.description || null,
                },
            });

            await this.updateAccountBalance(tx, {
                accountId: account.id,
                userId,
                amount: dto.amount,
                type: dto.type,
                operation: 'apply',
            });

            return transaction;
        });
    }

    async getAllTransactions(userId: string, filters: GetTransactionsDto) {
        const take = filters.limit ?? 10;

        const where = this.buildTransactionsWhere(userId, filters);

        const data = await this.prismaService.transactions.findMany({
            where,
            skip: filters.page ? (filters.page - 1) * take : undefined,
            take: filters.page ? take : undefined,
            select: {
                id: true,
                amount: true,
                type: true,
                description: true,
                transaction_date: true,
                accounts: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                transaction_date: 'desc',
            },
        });

        const total = await this.prismaService.transactions.count({ where });

        return {
            data,
            meta: {
                total,
                page: filters.page ?? 1,
                limit: take,
                totalPages: Math.ceil(total / take),
            },
        };
    }

    async getTransactionById(
        userId: string,
        transactionId: string,
        tx: Prisma.TransactionClient = this.prismaService,
    ) {
        const transaction = await tx.transactions.findFirst({
            where: {
                accounts: {
                    is: {
                        user_id: BigInt(userId),
                    },
                },
                id: BigInt(transactionId),
            },
            select: {
                id: true,
                amount: true,
                type: true,
                description: true,
                transaction_date: true,
                accounts: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                categories: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        if (!transaction) {
            throw new NotFoundException('Операция не найдена');
        }

        return transaction;
    }

    async editTransaction(
        userId: string,
        transactionId: string,
        dto: PatchTransactionsDto,
    ) {
        return await this.prismaService.$transaction(async (tx) => {
            const prevTransaction = await this.getTransactionById(
                userId,
                transactionId,
                tx,
            );

            const previousType = this.assertTransactionType(
                prevTransaction.type,
            );

            const newType = dto.type ?? previousType;
            const newCategoryId = dto.categoryId
                ? BigInt(dto.categoryId)
                : prevTransaction.categories.id;

            const category = await this.findUserCategory(
                userId,
                newCategoryId.toString(),
                tx,
            );

            if (newType !== category.type) {
                throw new BadRequestException(
                    'Тип транзакции не соответствует типу категории',
                );
            }

            const newAmount = dto.amount ?? prevTransaction.amount;
            const newDescription =
                dto.description ?? prevTransaction.description;

            await this.updateAccountBalance(tx, {
                accountId: prevTransaction.accounts.id,
                userId,
                amount: prevTransaction.amount,
                type: previousType,
                operation: 'revert',
            });

            await this.updateAccountBalance(tx, {
                accountId: prevTransaction.accounts.id,
                userId,
                amount: newAmount,
                type: newType,
                operation: 'apply',
            });

            const transaction = await tx.transactions.update({
                where: {
                    id: BigInt(transactionId),
                },
                data: {
                    category_id: BigInt(category.id),
                    amount: newAmount,
                    type: category.type,
                    description: newDescription,
                },
            });

            return transaction;
        });
    }

    async deleteTransaction(userId: string, transactionId: string) {
        return await this.prismaService.$transaction(async (tx) => {
            const prevTransaction = await this.getTransactionById(
                userId,
                transactionId,
                tx,
            );

            const previousType = this.assertTransactionType(
                prevTransaction.type,
            );

            await this.updateAccountBalance(tx, {
                accountId: prevTransaction.accounts.id,
                userId,
                amount: prevTransaction.amount,
                type: previousType,
                operation: 'revert',
            });

            await tx.transactions.delete({
                where: {
                    id: BigInt(transactionId),
                },
            });
        });
    }

    async getTransactionStatistics(
        userId: string,
        dto: StatisticTransactionsDto,
    ) {
        const groupStats = await this.prismaService.transactions.groupBy({
            by: ['type'],
            _sum: {
                amount: true,
            },
            where: this.buildTransactionsWhere(userId, dto),
        });

        const income = groupStats.find((group) => group.type === 'income');
        const expense = groupStats.find((group) => group.type === 'expense');

        const incomeAmount = income?._sum.amount ?? 0;
        const expenseAmount = expense?._sum.amount ?? 0;

        return {
            income: incomeAmount,
            expense: expenseAmount,
            difference: new Prisma.Decimal(incomeAmount).minus(
                new Prisma.Decimal(expenseAmount),
            ),
        };
    }

    async getTransactionStatisticsByCategories(
        userId: string,
        dto: StatisticTransactionsDto,
    ) {
        const expensesByCategory = await this.sumExpensesByCategory(
            userId,
            dto,
        );
        const categoryNames = await this.findCategoryNames(
            userId,
            expensesByCategory.map((item) => item.category_id),
        );

        return this.toCategoryStatistics(expensesByCategory, categoryNames);
    }

    async getTransactionStatisticsByMonths(
        userId: string,
        dto: StatisticTransactionsDto,
    ) {
        const currentYear = new Date().getFullYear();

        const dateFrom = dto.dateFrom
            ? new Date(dto.dateFrom)
            : new Date(`${currentYear}-01-01`);
        const dateTo = dto.dateTo
            ? new Date(dto.dateTo)
            : new Date(`${currentYear}-12-31`);
        const accountId = dto.accountId ? BigInt(dto.accountId) : null;

        const dateConditions = Prisma.sql`
            ${
                dateFrom
                    ? Prisma.sql`AND t.transaction_date >= ${dateFrom}::date`
                    : Prisma.empty
            }
            ${
                dateTo
                    ? Prisma.sql`AND t.transaction_date < ${dateTo}::date`
                    : Prisma.empty
            }
            ${
                accountId
                    ? Prisma.sql`AND t.account_id = ${BigInt(accountId)}`
                    : Prisma.empty
            }
        `;

        return this.prismaService.$queryRaw`
            with months as (
                SELECT generate_series(
                    DATE_TRUNC('month', ${dateFrom}::date),
                    DATE_TRUNC('month', ${dateTo}::date),
                    INTERVAL '1 month'
                ) as month
            )
            select 
                COALESCE(SUM(case when t.type = 'income' then t.amount else 0 end),0) as income,
                COALESCE(sum(case when t.type = 'expense' then t.amount else 0 end),0) as expense,
                COALESCE(SUM(case when t.type = 'income' then t.amount else 0 end) 
                -
                sum(case when t.type = 'expense' then t.amount else 0 end),0) as difference,
                m.month
            from months m
            left join transactions t 
                on DATE_TRUNC('month', t.transaction_date) = m.month 
                and exists
                (
                    select 1 from accounts a
                    where a.id = t.account_id and a.user_id = ${BigInt(userId)}
                )
            ${dateConditions}
            group by m.month
            order by m.month
        `;
    }

    private sumExpensesByCategory(
        userId: string,
        dto: StatisticTransactionsDto,
    ) {
        return this.prismaService.transactions.groupBy({
            by: ['category_id'],
            _sum: {
                amount: true,
            },
            where: {
                ...this.buildTransactionsWhere(userId, dto),
                type: 'expense',
            },
        });
    }

    private async findCategoryNames(userId: string, categoryIds: bigint[]) {
        if (categoryIds.length === 0) {
            return new Map<string, string>();
        }

        const categories = await this.prismaService.categories.findMany({
            where: {
                id: { in: categoryIds },
                user_id: BigInt(userId),
            },
            select: {
                id: true,
                name: true,
            },
        });

        return new Map(
            categories.map((category) => [
                category.id.toString(),
                category.name,
            ]),
        );
    }

    private toCategoryStatistics(
        expensesByCategory: Awaited<
            ReturnType<TransactionsService['sumExpensesByCategory']>
        >,
        categoryNames: Map<string, string>,
    ) {
        const total = expensesByCategory.reduce(
            (sum, item) => sum.plus(item._sum.amount ?? 0),
            new Prisma.Decimal(0),
        );

        return expensesByCategory.map((item) => {
            const amount = new Prisma.Decimal(item._sum.amount ?? 0);

            return {
                categoryName:
                    categoryNames.get(item.category_id.toString()) ??
                    'Неизвестная категория',
                amount,
                percentage: this.expenseShare(amount, total),
            };
        });
    }

    private expenseShare(amount: Prisma.Decimal, total: Prisma.Decimal) {
        if (total.isZero()) {
            return 0;
        }

        return amount.div(total).mul(100).toDecimalPlaces(0).toNumber();
    }

    private assertTransactionType(type: string): TransactionType {
        if (
            type === TransactionType.INCOME ||
            type === TransactionType.EXPENSE
        ) {
            return type;
        }

        throw new BadRequestException('Неизвестный тип транзакции');
    }

    private async findUserAccount(userId: string, accountId: string) {
        const account = await this.prismaService.accounts.findFirst({
            where: {
                id: BigInt(accountId),
                user_id: BigInt(userId),
            },
        });

        if (!account) {
            throw new NotFoundException(
                'Счет указанного пользователя не найден',
            );
        }

        return account;
    }

    private async findUserCategory(
        userId: string,
        categoryId: string,
        tx: Prisma.TransactionClient = this.prismaService,
    ) {
        const category = await tx.categories.findFirst({
            where: {
                user_id: BigInt(userId),
                id: BigInt(categoryId),
            },
        });

        if (!category) {
            throw new NotFoundException('Выбранная категория не найдена');
        }

        return category;
    }

    private async updateAccountBalance(
        tx: Prisma.TransactionClient,
        params: {
            accountId: bigint;
            userId: string;
            amount: number | Prisma.Decimal;
            type: TransactionType;
            operation: 'apply' | 'revert';
        },
    ) {
        const { accountId, userId, amount, type, operation } = params;

        const shouldIncrease =
            (operation === 'apply' && type === 'income') ||
            (operation === 'revert' && type === 'expense');

        if (shouldIncrease) {
            await tx.accounts.update({
                where: {
                    id: BigInt(accountId),
                    user_id: BigInt(userId),
                },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            });
        } else {
            const result = await tx.accounts.updateMany({
                where: {
                    id: BigInt(accountId),
                    user_id: BigInt(userId),
                    balance: {
                        gte: amount,
                    },
                },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            });

            if (result.count === 0) {
                throw new BadRequestException('Недостаточно средств на счёте');
            }
        }
    }

    private buildTransactionsWhere(
        userId: string,
        filters: GetTransactionsDto,
    ): Prisma.transactionsWhereInput {
        const where: Prisma.transactionsWhereInput = {
            accounts: {
                is: {
                    user_id: BigInt(userId),
                },
            },
        };

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.accountId) {
            where.account_id = BigInt(filters.accountId);
        }

        if (filters.categoryId) {
            where.category_id = BigInt(filters.categoryId);
        }

        if (filters.dateFrom || filters.dateTo) {
            const dateTo = filters.dateTo
                ? new Date(filters.dateTo)
                : undefined;

            dateTo?.setDate(dateTo.getDate() + 1);

            where.transaction_date = {
                gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
                lt: dateTo,
            };
        }

        return where;
    }
}
