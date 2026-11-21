import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionsService } from '../src/transactions/transactions.service';
import { TransactionType } from '../src/common';

describe('Transactions integration', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let service: TransactionsService;

    let userId: bigint;
    let accountId: bigint;
    let categoryExpenseId: bigint;
    let categoryIncomeId: bigint;

    let accountDefaultBalance = 1000;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get(PrismaService);

        service = app.get(TransactionsService);

        const currency = await prisma.currencies.upsert({
            where: { code: 'RUB' },
            update: {},
            create: {
                code: 'RUB',
                name: 'Российский рубль',
                symbol: '₽',
            },
        });

        const user = await prisma.users.upsert({
            where: { email: 'integration-test@example.com' },
            update: { base_currency_id: currency.id },
            create: {
                email: 'integration-test@example.com',
                password_hash: 'test-hash',
                name: 'Integration Test',
                base_currency_id: currency.id,
            },
        });

        userId = user.id;

        const account = await prisma.accounts.create({
            data: {
                user_id: userId,
                currency_id: currency.id,
                name: 'Integration Test Account',
                type: 'debit',
                balance: accountDefaultBalance,
            },
        });

        accountId = account.id;

        const expenseCategory = await prisma.categories.create({
            data: {
                user_id: userId,
                name: 'Integration Test Expense',
                type: TransactionType.EXPENSE,
            },
        });

        const incomeCategory = await prisma.categories.create({
            data: {
                user_id: userId,
                name: 'Integration Test Income',
                type: TransactionType.INCOME,
            },
        });

        categoryExpenseId = expenseCategory.id;
        categoryIncomeId = incomeCategory.id;
    });

    beforeEach(async () => {
        await prisma.transactions.deleteMany({
            where: { account_id: accountId },
        });

        await prisma.accounts.update({
            where: { id: accountId },
            data: { balance: accountDefaultBalance },
        });
    });

    afterAll(async () => {
        await prisma.transactions.deleteMany({
            where: {
                accounts: {
                    user_id: userId,
                },
            },
        });

        await prisma.transfers.deleteMany({
            where: {
                OR: [
                    {
                        accounts_transfers_from_account_idToaccounts: {
                            user_id: userId,
                        },
                    },
                    {
                        accounts_transfers_to_account_idToaccounts: {
                            user_id: userId,
                        },
                    },
                ],
            },
        });

        await prisma.accounts.deleteMany({
            where: { user_id: userId },
        });

        await prisma.categories.deleteMany({
            where: { user_id: userId },
        });

        await prisma.users.delete({
            where: { id: userId },
        });

        await app.close();
    });

    it('should connect to test database', async () => {
        const result = await prisma.$queryRaw<
            { database: string }[]
        >`SELECT current_database() AS database`;

        expect(result[0].database).toBe('pet_project_test');
    });

    it('should create an expense transaction and decrease account balance', async () => {
        const transaction = await service.create(userId.toString(), {
            accountId: accountId.toString(),
            categoryId: categoryExpenseId.toString(),
            amount: 200,
            type: TransactionType.EXPENSE,
            description: 'Integration test expense',
        });

        expect(transaction).toBeDefined();

        const savedTransaction = await prisma.transactions.findUnique({
            where: { id: transaction.id },
        });

        const updatedAccount = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(savedTransaction.amount.toString()).toBe('200');
        expect(updatedAccount.balance.toString()).toBe(
            String(accountDefaultBalance - 200),
        );
    });

    it('shoul throw error not enough money', async () => {
        await expect(
            service.create(userId.toString(), {
                accountId: accountId.toString(),
                categoryId: categoryExpenseId.toString(),
                amount: accountDefaultBalance + 100,
                type: TransactionType.EXPENSE,
                description: 'Integration test expense',
            }),
        ).rejects.toThrow('Недостаточно средств на счёте');

        const account = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(account.balance.toString()).toBe(String(accountDefaultBalance));

        const transactionsCount = await prisma.transactions.count({
            where: { account_id: accountId },
        });

        expect(transactionsCount).toBe(0);
    });

    it('should create an income transaction and increase account balance', async () => {
        const transaction = await service.create(userId.toString(), {
            accountId: accountId.toString(),
            categoryId: categoryIncomeId.toString(),
            amount: 500,
            type: TransactionType.INCOME,
            description: 'Integration test income',
        });

        expect(transaction).toBeDefined();

        const transactionsCount = await prisma.transactions.count({
            where: { account_id: accountId },
        });

        expect(transactionsCount).toBe(1);

        const account = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(account.balance.toString()).toBe(
            String(accountDefaultBalance + 500),
        );

        const savedTransaction = await prisma.transactions.findUnique({
            where: { id: transaction.id },
        });

        expect(savedTransaction).not.toBeNull();
        expect(savedTransaction?.type).toBe('income');
        expect(savedTransaction?.amount.toString()).toBe('500');
    });

    it('test edit transaction', async () => {
        const transaction = await service.create(userId.toString(), {
            accountId: accountId.toString(),
            categoryId: categoryIncomeId.toString(),
            amount: 500,
            type: TransactionType.INCOME,
            description: 'Integration test income',
        });

        expect(transaction).toBeDefined();

        const editTransaction = await service.editTransaction(
            userId.toString(),
            transaction.id.toString(),
            {
                amount: 900,
            },
        );

        expect(editTransaction).toBeDefined();

        const account = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(account.balance.toString()).toBe(
            String(accountDefaultBalance + 900),
        );

        const transactionsCount = await prisma.transactions.count({
            where: { account_id: accountId },
        });

        expect(transactionsCount).toBe(1);

        const savedTransaction = await prisma.transactions.findUnique({
            where: { id: transaction.id },
        });

        expect(savedTransaction?.amount.toString()).toBe('900');
        expect(savedTransaction?.type).toBe('income');
    });

    it('test edit transaction from income to expense', async () => {
        const transaction = await service.create(userId.toString(), {
            accountId: accountId.toString(),
            categoryId: categoryIncomeId.toString(),
            amount: 500,
            type: TransactionType.INCOME,
            description: 'Integration test income',
        });

        expect(transaction).toBeDefined();

        const editTransaction = await service.editTransaction(
            userId.toString(),
            transaction.id.toString(),
            {
                categoryId: categoryExpenseId.toString(),
                type: TransactionType.EXPENSE,
                amount: 900,
            },
        );

        expect(editTransaction).toBeDefined();

        const account = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(account.balance.toString()).toBe(
            String(accountDefaultBalance - 900),
        );

        const transactionsCount = await prisma.transactions.count({
            where: { account_id: accountId },
        });

        expect(transactionsCount).toBe(1);

        const savedTransaction = await prisma.transactions.findUnique({
            where: { id: transaction.id },
        });

        expect(savedTransaction?.amount.toString()).toBe('900');
        expect(savedTransaction?.type).toBe('expense');
        expect(savedTransaction?.category_id).toBe(categoryExpenseId);
    });

    it('test edit transaction from income to expense when not enough money', async () => {
        const transaction = await service.create(userId.toString(), {
            accountId: accountId.toString(),
            categoryId: categoryIncomeId.toString(),
            amount: 500,
            type: TransactionType.INCOME,
            description: 'Integration test income',
        });

        expect(transaction).toBeDefined();

        await expect(
            service.editTransaction(
                userId.toString(),
                transaction.id.toString(),
                {
                    categoryId: categoryExpenseId.toString(),
                    type: TransactionType.EXPENSE,
                    amount: 1200,
                },
            ),
        ).rejects.toThrow('Недостаточно средств на счёте');

        const account = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(account.balance.toString()).toBe(
            String(accountDefaultBalance + 500),
        );

        const transactionsCount = await prisma.transactions.count({
            where: { account_id: accountId },
        });

        expect(transactionsCount).toBe(1);

        const savedTransaction = await prisma.transactions.findUnique({
            where: { id: transaction.id },
        });

        expect(savedTransaction?.amount.toString()).toBe('500');
        expect(savedTransaction?.type).toBe('income');
        expect(savedTransaction?.category_id).toBe(categoryIncomeId);
    });

    it('test delete income transaction', async () => {
        const transaction = await service.create(userId.toString(), {
            accountId: accountId.toString(),
            categoryId: categoryIncomeId.toString(),
            amount: 500,
            type: TransactionType.INCOME,
            description: 'Integration test income',
        });

        expect(transaction).toBeDefined();

        await service.deleteTransaction(
            userId.toString(),
            transaction.id.toString(),
        );

        const transactionsCount = await prisma.transactions.count({
            where: { account_id: accountId },
        });

        expect(transactionsCount).toBe(0);

        const deletedTransaction = await prisma.transactions.findUnique({
            where: { id: transaction.id },
        });

        expect(deletedTransaction).toBeNull();

        const account = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(account.balance.toString()).toBe(String(accountDefaultBalance));
    });

    it('test delete expense transaction', async () => {
        const transaction = await service.create(userId.toString(), {
            accountId: accountId.toString(),
            categoryId: categoryExpenseId.toString(),
            amount: 500,
            type: TransactionType.EXPENSE,
            description: 'Integration test expense',
        });

        expect(transaction).toBeDefined();

        await service.deleteTransaction(
            userId.toString(),
            transaction.id.toString(),
        );

        const transactionsCount = await prisma.transactions.count({
            where: { account_id: accountId },
        });

        expect(transactionsCount).toBe(0);

        const deletedTransaction = await prisma.transactions.findUnique({
            where: { id: transaction.id },
        });

        expect(deletedTransaction).toBeNull();

        const account = await prisma.accounts.findUnique({
            where: { id: accountId },
        });

        expect(account.balance.toString()).toBe(String(accountDefaultBalance));
    });
});
