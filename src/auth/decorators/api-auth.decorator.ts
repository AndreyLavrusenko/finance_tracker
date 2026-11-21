import { applyDecorators } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from '../responses/auth-response.dto';
import { RefreshTokensResponseDto } from '../responses/refresh-tokens-response.dto';
import { UserResponseDto } from '../responses/user-response.dto';

const ApiValidationError = () =>
    ApiResponse({ status: 400, description: 'Validation error' });

const ApiUnauthorized = () =>
    ApiResponse({ status: 401, description: 'Wrong credentials' });

export const ApiRegister = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Register a new user',
            description: 'Creates a new user account',
        }),
        ApiCreatedResponse({
            description: 'User successfully registered',
            type: AuthResponseDto,
        }),
        ApiResponse({
            status: 409,
            description: 'User with this email already exists',
        }),
        ApiValidationError(),
    );

export const ApiLogin = () =>
    applyDecorators(
        ApiOperation({
            summary: 'Login user',
            description: 'Login in already created account',
        }),
        ApiOkResponse({
            description: 'User successfully login',
            type: AuthResponseDto,
        }),
        ApiUnauthorized(),
    );

export const ApiRefresh = () =>
    applyDecorators(
        ApiOperation({ summary: 'Update user token' }),
        ApiOkResponse({
            description: 'Token successfully update',
            type: RefreshTokensResponseDto,
        }),
        ApiUnauthorized(),
    );

export const ApiGetMe = () =>
    applyDecorators(
        ApiOperation({ summary: 'Get user info' }),
        ApiOkResponse({
            description: 'User data',
            type: UserResponseDto,
        }),
        ApiUnauthorized(),
    );
