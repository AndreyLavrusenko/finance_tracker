import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../../auth/responses/user-response.dto';

const ApiValidationError = () =>
    ApiResponse({ status: 400, description: 'Validation error' });

const ApiUnauthorized = () =>
    ApiResponse({ status: 401, description: 'Unauthorized' });

const ApiUserNotFound = () =>
    ApiResponse({ status: 404, description: 'User not found' });

export const ApiGetProfile = () =>
    applyDecorators(
        ApiOperation({ summary: 'Get the current user profile' }),
        ApiOkResponse({
            description: 'User profile',
            type: UserResponseDto,
        }),
        ApiUserNotFound(),
        ApiUnauthorized(),
    );

export const ApiUpdateProfile = () =>
    applyDecorators(
        ApiOperation({ summary: 'Update the current user name' }),
        ApiOkResponse({
            description: 'Updated profile',
            type: UserResponseDto,
        }),
        ApiValidationError(),
        ApiUserNotFound(),
        ApiUnauthorized(),
    );

export const ApiDeleteProfile = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Delete the current user and related records',
        }),
        ApiOkResponse({
            description: 'Deleted profile',
            type: UserResponseDto,
        }),
        ApiUserNotFound(),
        ApiUnauthorized(),
    );
