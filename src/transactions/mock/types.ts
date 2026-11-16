import { PrismaService } from '../../prisma/prisma.service';

export type AccountsUpdateManyMock = jest.MockedFunction<
    PrismaService['accounts']['updateMany']
>;

export type AccountsUpdateMock = jest.MockedFunction<
    PrismaService['accounts']['update']
>;

export type AccountsFindFirstMock = jest.MockedFunction<
    PrismaService['accounts']['findFirst']
>;

export type TransactionsFindFirstMock = jest.MockedFunction<
    PrismaService['transactions']['findFirst']
>;

export type CategoriesFindFirstMock = jest.MockedFunction<
    PrismaService['categories']['findFirst']
>;

export type TransactionsCreateMock = jest.MockedFunction<
    PrismaService['transactions']['create']
>;

export type TransactionsUpdateMock = jest.MockedFunction<
    PrismaService['transactions']['update']
>;

export type TransactionsDeleteMock = jest.MockedFunction<
    PrismaService['transactions']['delete']
>;

type TransactionCallback = (tx: {
    accounts: {
        findFirst: AccountsFindFirstMock;
        update: AccountsUpdateMock;
        updateMany: AccountsUpdateManyMock;
    };
    categories: {
        findFirst: CategoriesFindFirstMock;
    };
    transactions: {
        create: TransactionsCreateMock;
        findFirst: TransactionsFindFirstMock;
        update: TransactionsUpdateMock;
        delete: TransactionsDeleteMock;
    };
}) => Promise<unknown>;

export type TransactionMock = jest.MockedFunction<
    (callback: TransactionCallback) => Promise<unknown>
>;
