import { Prisma } from '../../generated/prisma/client';
import {
    AccountsFindFirstMock,
    AccountsUpdateMock,
    AccountsUpdateManyMock,
    CategoriesFindFirstMock,
    TransactionsCreateMock,
    TransactionsFindFirstMock,
    TransactionsUpdateMock,
    TransactionsDeleteMock,
    TransactionMock,
} from './types';

export const prismaMock = {
    accounts: {
        findFirst: jest.fn() as AccountsFindFirstMock,
        update: jest.fn() as AccountsUpdateMock,
        updateMany: jest.fn() as AccountsUpdateManyMock,
    },
    categories: {
        findFirst: jest.fn() as CategoriesFindFirstMock,
    },
    transactions: {
        create: jest.fn() as TransactionsCreateMock,
        findFirst: jest.fn() as TransactionsFindFirstMock,
        update: jest.fn() as TransactionsUpdateMock,
        delete: jest.fn() as TransactionsDeleteMock,
    },
    $transaction: jest.fn() as TransactionMock,
};

export const mockAccount = {
    id: BigInt(1),
    user_id: BigInt(1),
    currency_id: BigInt(1),
    name: 'Основной счёт',
    type: 'debit',
    balance: new Prisma.Decimal(1000),
    created_at: new Date(),
};

export const mockCategory = (type: 'income' | 'expense' = 'expense') => {
    return {
        id: BigInt(1),
        user_id: BigInt(1),
        name: 'Продукты',
        type,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
    };
};

export const mockTransaction = (type: 'income' | 'expense' = 'expense') => {
    return {
        id: BigInt(1),
        account_id: BigInt(1),
        category_id: BigInt(1),
        amount: new Prisma.Decimal(200),
        type,
        description: null,
        transaction_date: new Date('2026-01-01T00:00:00.000Z'),
        created_at: new Date('2026-01-01T00:00:00.000Z'),
    };
};

export const mockPreviousTransaction = {
    id: BigInt(1),
    amount: new Prisma.Decimal(200),
    type: 'expense',
    description: null,
    transaction_date: new Date(),
    account_id: BigInt(1),
    category_id: BigInt(1),
    created_at: new Date(),
    accounts: {
        id: BigInt(1),
        name: 'Основной счёт',
        type: 'debit',
    },
    categories: {
        id: BigInt(1),
        name: 'Продукты',
        type: 'expense',
    },
};
