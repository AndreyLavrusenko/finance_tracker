import { applyDecorators } from '@nestjs/common';
import {
    ApiBody,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { StatisticTransactionsDto } from '../dto/statistic-transactions.dto';
import {
    CategoryStatisticsResponseDto,
    MonthStatisticsResponseDto,
    TransactionStatisticsResponseDto,
} from '../responses/transaction-statistics-response.dto';
import { TransactionListResponseDto } from '../responses/transaction-list-response.dto';
import { TransactionResponseDto } from '../responses/transaction-response.dto';
import { TransactionViewResponseDto } from '../responses/transaction-view-response.dto';

const ApiValidationError = () =>
    ApiResponse({ status: 400, description: 'Validation error' });

const ApiUnauthorized = () =>
    ApiResponse({ status: 401, description: 'Unauthorized' });

const ApiTransactionNotFound = () =>
    ApiResponse({ status: 404, description: 'Transaction not found' });

export const ApiCreateTransaction = () =>
    applyDecorators(
        ApiOperation({ summary: 'Create a transaction' }),
        ApiCreatedResponse({
            description: 'Transaction created',
            type: TransactionResponseDto,
        }),
        ApiResponse({
            status: 400,
            description:
                'Validation error, transaction type does not match the category, or insufficient funds',
        }),
        ApiResponse({
            status: 404,
            description: 'Account or category not found',
        }),
        ApiUnauthorized(),
    );

export const ApiGetTransactions = () =>
    applyDecorators(
        ApiOperation({ summary: 'List transactions of the current user' }),
        ApiOkResponse({
            description: 'Transactions page',
            type: TransactionListResponseDto,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
    );

export const ApiGetTransactionStatistics = () =>
    applyDecorators(
        ApiOperation({ summary: 'Income, expense and difference' }),
        ApiBody({ type: StatisticTransactionsDto, required: false }),
        ApiOkResponse({
            description: 'Transaction totals',
            type: TransactionStatisticsResponseDto,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
    );

export const ApiGetCategoryStatistics = () =>
    applyDecorators(
        ApiOperation({ summary: 'Expenses grouped by category' }),
        ApiBody({ type: StatisticTransactionsDto, required: false }),
        ApiOkResponse({
            description: 'Category expense shares',
            type: CategoryStatisticsResponseDto,
            isArray: true,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
    );

export const ApiGetMonthStatistics = () =>
    applyDecorators(
        ApiOperation({ summary: 'Income and expense by month' }),
        ApiBody({ type: StatisticTransactionsDto, required: false }),
        ApiOkResponse({
            description: 'Monthly totals',
            type: MonthStatisticsResponseDto,
            isArray: true,
        }),
        ApiValidationError(),
        ApiUnauthorized(),
    );

export const ApiGetTransaction = () =>
    applyDecorators(
        ApiOperation({ summary: 'Get a transaction by id' }),
        ApiOkResponse({
            description: 'Transaction',
            type: TransactionViewResponseDto,
        }),
        ApiTransactionNotFound(),
        ApiUnauthorized(),
    );

export const ApiUpdateTransaction = () =>
    applyDecorators(
        ApiOperation({ summary: 'Update a transaction' }),
        ApiOkResponse({
            description: 'Transaction updated',
            type: TransactionResponseDto,
        }),
        ApiResponse({
            status: 400,
            description:
                'Validation error, transaction type does not match the category, or insufficient funds',
        }),
        ApiResponse({
            status: 404,
            description: 'Transaction or category not found',
        }),
        ApiUnauthorized(),
    );
