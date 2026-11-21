import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CurrencyResponseDto } from '../responses/currency-response.dto';

export const ApiGetCurrencies = () =>
    applyDecorators(
        ApiOperation({ summary: 'List currencies' }),
        ApiOkResponse({
            description: 'Currencies',
            type: CurrencyResponseDto,
            isArray: true,
        }),
    );

export const ApiGetCurrency = () =>
    applyDecorators(
        ApiOperation({ summary: 'Get a currency by id' }),
        ApiOkResponse({
            description: 'Currency',
            type: CurrencyResponseDto,
        }),
    );
