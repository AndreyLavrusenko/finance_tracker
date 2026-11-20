import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
    mockAccount,
    mockCategory,
    mockPreviousTransaction,
    mockTransaction,
    prismaMock,
} from './mock';
import { Prisma } from '../generated/prisma/client';

jest.mock('@nestjs/config', () => ({
    ConfigService: class ConfigService {},
    ConfigModule: class ConfigModule {},
}));

describe('TransactionsService', () => {
    let service: TransactionsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        prismaMock.$transaction.mockImplementation((callback) =>
            callback(prismaMock),
        );

        service = module.get<TransactionsService>(TransactionsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create an expense transaction', async () => {
        prismaMock.accounts.findFirst.mockResolvedValue(mockAccount);
        prismaMock.categories.findFirst.mockResolvedValue(mockCategory());
        prismaMock.accounts.updateMany.mockResolvedValue({ count: 1 });
        prismaMock.transactions.create.mockResolvedValue(mockTransaction());

        const result = await service.create('1', {
            accountId: '1',
            categoryId: '1',
            amount: 200,
            type: 'expense',
        });

        expect(prismaMock.transactions.create).toHaveBeenCalled();
        expect(prismaMock.transactions.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.transactions.create).toHaveBeenLastCalledWith({
            data: {
                account_id: BigInt(1),
                category_id: BigInt(1),
                amount: 200,
                type: 'expense',
                description: null,
            },
        });
        expect(result).toEqual(mockTransaction());

        expect(prismaMock.accounts.updateMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.accounts.updateMany).toHaveBeenCalledWith({
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
                balance: {
                    gte: 200,
                },
            },
            data: {
                balance: {
                    decrement: 200,
                },
            },
        });
    });

    it('should throw when account has insufficient funds', async () => {
        prismaMock.accounts.findFirst.mockResolvedValue(mockAccount);
        prismaMock.categories.findFirst.mockResolvedValue(mockCategory());
        prismaMock.accounts.updateMany.mockResolvedValue({ count: 0 });

        await expect(
            service.create('1', {
                accountId: '1',
                categoryId: '1',
                amount: 200,
                type: 'expense',
            }),
        ).rejects.toThrow('Недостаточно средств на счёте');

        expect(prismaMock.transactions.create).toHaveBeenCalledTimes(1);
    });

    it('should throw when account is not found', async () => {
        prismaMock.accounts.findFirst.mockResolvedValue(null);

        await expect(
            service.create('1', {
                accountId: '1',
                categoryId: '1',
                amount: 200,
                type: 'expense',
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should throw when category is not found', async () => {
        prismaMock.accounts.findFirst.mockResolvedValue(mockAccount);
        prismaMock.categories.findFirst.mockResolvedValue(null);

        await expect(
            service.create('1', {
                accountId: '1',
                categoryId: '1',
                amount: 200,
                type: 'expense',
            }),
        ).rejects.toThrow(NotFoundException);
    });

    it('should throw when category id is wrong', async () => {
        prismaMock.accounts.findFirst.mockResolvedValue(mockAccount);
        prismaMock.categories.findFirst.mockResolvedValue({
            ...mockCategory('income'),
        });

        await expect(
            service.create('1', {
                accountId: '1',
                categoryId: '1',
                amount: 200,
                type: 'expense',
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('should create an income transaction', async () => {
        prismaMock.accounts.findFirst.mockResolvedValue(mockAccount);
        prismaMock.categories.findFirst.mockResolvedValue(
            mockCategory('income'),
        );
        prismaMock.transactions.create.mockResolvedValue(
            mockTransaction('income'),
        );

        const result = await service.create('1', {
            accountId: '1',
            categoryId: '1',
            amount: 200,
            type: 'income',
        });

        expect(prismaMock.transactions.create).toHaveBeenCalledTimes(1);
        expect(prismaMock.transactions.create).toHaveBeenLastCalledWith({
            data: {
                account_id: BigInt(1),
                category_id: BigInt(1),
                amount: 200,
                type: 'income',
                description: null,
            },
        });
        expect(result).toEqual(mockTransaction('income'));

        expect(prismaMock.accounts.update).toHaveBeenCalledTimes(1);
        expect(prismaMock.accounts.update).toHaveBeenCalledWith({
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
            },
            data: {
                balance: {
                    increment: 200,
                },
            },
        });
    });

    it('should edit an expense transaction', async () => {
        prismaMock.transactions.findFirst.mockResolvedValue(
            mockPreviousTransaction,
        );

        prismaMock.categories.findFirst.mockResolvedValue(
            mockCategory('expense'),
        );

        prismaMock.accounts.update.mockResolvedValue(mockAccount);
        prismaMock.accounts.updateMany.mockResolvedValue({ count: 1 });

        const updatedTransaction = {
            ...mockPreviousTransaction,
            amount: new Prisma.Decimal(300),
        };

        prismaMock.transactions.update.mockResolvedValue(updatedTransaction);

        const result = await service.editTransaction('1', '1', {
            amount: 300,
        });

        expect(prismaMock.accounts.update).toHaveBeenCalledTimes(1);
        expect(prismaMock.accounts.update).toHaveBeenCalledWith({
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
            },
            data: {
                balance: {
                    increment: mockPreviousTransaction.amount,
                },
            },
        });

        expect(prismaMock.accounts.updateMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.accounts.updateMany).toHaveBeenCalledWith({
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
                balance: {
                    gte: 300,
                },
            },
            data: {
                balance: {
                    decrement: 300,
                },
            },
        });

        expect(result).toEqual({
            ...mockPreviousTransaction,
            amount: new Prisma.Decimal(300),
        });
    });

    it('should change expense to income', async () => {
        prismaMock.transactions.findFirst.mockResolvedValue(
            mockPreviousTransaction,
        );

        prismaMock.categories.findFirst.mockResolvedValue(
            mockCategory('income'),
        );

        const updatedTransaction = {
            ...mockPreviousTransaction,
            amount: new Prisma.Decimal(300),
            type: 'income',
            categories: {
                ...mockPreviousTransaction.categories,
                type: 'income',
            },
        };

        prismaMock.transactions.update.mockResolvedValue(updatedTransaction);

        const result = await service.editTransaction('1', '1', {
            amount: 300,
            type: 'income',
            categoryId: '2',
        });

        expect(prismaMock.accounts.update).toHaveBeenNthCalledWith(1, {
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
            },
            data: {
                balance: {
                    increment: mockPreviousTransaction.amount,
                },
            },
        });

        expect(prismaMock.accounts.update).toHaveBeenNthCalledWith(2, {
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
            },
            data: {
                balance: {
                    increment: 300,
                },
            },
        });

        expect(result).toEqual({
            ...mockPreviousTransaction,
            amount: new Prisma.Decimal(300),
            type: 'income',
            categories: {
                ...mockPreviousTransaction.categories,
                type: 'income',
            },
        });
    });

    it('should throw when transaction type does not match category type', async () => {
        prismaMock.transactions.findFirst.mockResolvedValue(
            mockPreviousTransaction,
        );

        prismaMock.categories.findFirst.mockResolvedValue(
            mockCategory('expense'),
        );

        await expect(
            service.editTransaction('1', '1', {
                type: 'income',
            }),
        ).rejects.toThrow(BadRequestException);

        expect(prismaMock.accounts.update).not.toHaveBeenCalled();
        expect(prismaMock.accounts.updateMany).not.toHaveBeenCalled();

        expect(prismaMock.transactions.update).not.toHaveBeenCalled();
    });

    it('should throw when transaction is not found', async () => {
        prismaMock.transactions.findFirst.mockResolvedValue(null);

        await expect(
            service.editTransaction('1', '999', {
                amount: 300,
            }),
        ).rejects.toThrow(NotFoundException);
        expect(prismaMock.accounts.update).not.toHaveBeenCalled();
        expect(prismaMock.accounts.updateMany).not.toHaveBeenCalled();

        expect(prismaMock.transactions.update).not.toHaveBeenCalled();
    });

    it('should delete an expense transaction', async () => {
        prismaMock.transactions.findFirst.mockResolvedValue(
            mockPreviousTransaction,
        );

        prismaMock.accounts.update.mockResolvedValue(mockAccount);
        prismaMock.transactions.delete.mockResolvedValue(
            mockPreviousTransaction,
        );

        await service.deleteTransaction('1', '1');

        expect(prismaMock.transactions.findFirst).toHaveBeenCalledTimes(1);
        expect(prismaMock.transactions.delete).toHaveBeenCalledTimes(1);

        expect(prismaMock.accounts.update).toHaveBeenCalledTimes(1);
        expect(prismaMock.accounts.updateMany).not.toHaveBeenCalled();
        expect(prismaMock.accounts.update).toHaveBeenCalledWith({
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
            },
            data: {
                balance: {
                    increment: mockPreviousTransaction.amount,
                },
            },
        });
    });

    it('should delete an income transaction', async () => {
        prismaMock.transactions.findFirst.mockResolvedValue({
            ...mockPreviousTransaction,
            type: 'income',
        });

        prismaMock.accounts.updateMany.mockResolvedValue({ count: 1 });
        prismaMock.transactions.delete.mockResolvedValue(
            mockPreviousTransaction,
        );

        await service.deleteTransaction('1', '1');

        expect(prismaMock.transactions.findFirst).toHaveBeenCalledTimes(1);
        expect(prismaMock.transactions.delete).toHaveBeenCalledTimes(1);

        expect(prismaMock.accounts.updateMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.accounts.update).not.toHaveBeenCalled();
        expect(prismaMock.accounts.updateMany).toHaveBeenCalledWith({
            where: {
                id: BigInt(1),
                user_id: BigInt(1),
                balance: {
                    gte: mockPreviousTransaction.amount,
                },
            },
            data: {
                balance: {
                    decrement: mockPreviousTransaction.amount,
                },
            },
        });
    });
});
