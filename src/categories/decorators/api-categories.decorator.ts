import { applyDecorators } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';
import { CategoryResponseDto } from '../responses/category-response.dto';

const ApiValidationError = () =>
    ApiResponse({ status: 400, description: 'Validation error' });

const ApiUnauthorized = () =>
    ApiResponse({ status: 401, description: 'Unauthorized' });

const ApiCategoryNotFound = () =>
    ApiResponse({ status: 404, description: 'Category not found' });

export const ApiCreateCategory = () =>
    applyDecorators(
        ApiOperation({ summary: 'Create a category' }),
        ApiCreatedResponse({
            description: 'Category created',
            type: CategoryResponseDto,
        }),
        ApiValidationError(),
        ApiResponse({
            status: 409,
            description: 'Category with this name already exists',
        }),
        ApiUnauthorized(),
    );

export const ApiGetCategories = () =>
    applyDecorators(
        ApiOperation({ summary: 'List categories of the current user' }),
        ApiOkResponse({
            description: 'Categories',
            type: CategoryResponseDto,
            isArray: true,
        }),
        ApiUnauthorized(),
    );

export const ApiGetCategory = () =>
    applyDecorators(
        ApiOperation({ summary: 'Get a category by id' }),
        ApiOkResponse({
            description: 'Category',
            type: CategoryResponseDto,
        }),
        ApiCategoryNotFound(),
        ApiUnauthorized(),
    );

export const ApiUpdateCategory = () =>
    applyDecorators(
        ApiOperation({ summary: 'Update a category' }),
        ApiOkResponse({
            description: 'Category updated',
            type: CategoryResponseDto,
        }),
        ApiResponse({
            status: 400,
            description: 'Validation error or no fields to update',
        }),
        ApiCategoryNotFound(),
        ApiUnauthorized(),
    );

export const ApiDeleteCategory = () =>
    applyDecorators(
        ApiOperation({ summary: 'Delete a category' }),
        ApiOkResponse({
            description: 'Category deleted',
            type: CategoryResponseDto,
        }),
        ApiCategoryNotFound(),
        ApiResponse({
            status: 409,
            description: 'Category still has transactions',
        }),
        ApiUnauthorized(),
    );
