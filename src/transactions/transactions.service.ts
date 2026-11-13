import { CreateTransactionsDto } from './dto/create-transactions.dto';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

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
            });

            return transaction;
        });
    }

    async getAllTransactions(userId: string) {
        return await this.prismaService.transactions.findMany({
            where: {
                accounts: {
                    is: {
                        user_id: BigInt(userId),
                    },
                },
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
            orderBy: {
                transaction_date: 'desc',
            },
        });
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

    private async findUserCategory(userId: string, categoryId: string) {
        const category = await this.prismaService.categories.findFirst({
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
            amount: number;
            type: 'income' | 'expense';
        },
    ) {
        const { accountId, userId, amount, type } = params;

        if (type === 'expense') {
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
        } else {
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
        }
    }
}
