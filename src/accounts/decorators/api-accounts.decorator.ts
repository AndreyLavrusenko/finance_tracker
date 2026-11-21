import { applyDecorators } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { AccountResponseDto } from '../responses/account-response.dto';

const ApiValidationError = () =>
    ApiResponse({ status: 400, description: 'Validation error' });

const ApiUnauthorized = () =>
    ApiResponse({ status: 401, description: 'Unauthorized' });

const ApiAccountNotFound = () =>
    ApiResponse({ status: 404, description: 'Account not found' });

export const ApiCreateAccount = () =>
    applyDecorators(
        ApiOperation({ summary: 'Create an account' }),
        ApiCreatedResponse({
            description: 'Account created',
            type: AccountResponseDto,
        }),
        ApiResponse({
            status: 400,
            description: 'Validation error or currency does not exist',
        }),
        ApiResponse({
            status: 409,
            description: 'Duplicate unique value',
        }),
        ApiUnauthorized(),
    );

export const ApiGetAccounts = () =>
    applyDecorators(
        ApiOperation({ summary: 'List accounts of the current user' }),
        ApiOkResponse({
            description: 'Accounts',
            type: AccountResponseDto,
            isArray: true,
        }),
        ApiUnauthorized(),
    );

export const ApiGetAccount = () =>
    applyDecorators(
        ApiOperation({ summary: 'Get an account by id' }),
        ApiOkResponse({
            description: 'Account',
            type: AccountResponseDto,
        }),
        ApiAccountNotFound(),
        ApiUnauthorized(),
    );

export const ApiUpdateAccount = () =>
    applyDecorators(
        ApiOperation({ summary: 'Update an account' }),
        ApiOkResponse({
            description: 'Account updated',
            type: AccountResponseDto,
        }),
        ApiResponse({
            status: 400,
            description: 'Validation error or no fields to update',
        }),
        ApiAccountNotFound(),
        ApiUnauthorized(),
    );

export const ApiDeleteAccount = () =>
    applyDecorators(
        ApiOperation({ summary: 'Delete an account' }),
        ApiOkResponse({
            description: 'Account deleted',
            type: AccountResponseDto,
        }),
        ApiAccountNotFound(),
        ApiUnauthorized(),
    );
