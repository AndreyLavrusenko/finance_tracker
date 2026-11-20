import {
    BadGatewayException,
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import {
    ConversionResult,
    CurrencyCode,
    ExchangeRateResponse,
    FrankfurterRateResponse,
} from './types/exchange-rate.types';
import { Prisma } from '../generated/prisma/client';
import { EXCHANGE_RATE_ERRORS } from './exchange-rate.constants';

@Injectable()
export class ExchangeRateService {
    async getExchangeRate(
        from: CurrencyCode,
        to: CurrencyCode,
    ): Promise<ExchangeRateResponse> {
        if (from === to) {
            return {
                date: new Date().toISOString().split('T')[0],
                base: from,
                quote: to,
                rate: 1,
            };
        }

        try {
            const response = await fetch(
                `https://api.frankfurter.dev/v2/rate/${from}/${to}`,
            );

            if (!response.ok) {
                throw new BadGatewayException(
                    EXCHANGE_RATE_ERRORS.UPSTREAM_RESPONSE_FAILED,
                );
            }

            const data: FrankfurterRateResponse = await response.json();

            return {
                date: data.date,
                base: data.base,
                quote: data.quote,
                rate: data.rate,
            };
        } catch (error) {
            if (error instanceof BadGatewayException) {
                throw error;
            }

            throw new BadGatewayException(
                EXCHANGE_RATE_ERRORS.UPSTREAM_UNAVAILABLE,
            );
        }
    }

    async convert(
        amount: string,
        from: CurrencyCode,
        to: CurrencyCode,
    ): Promise<ConversionResult> {
        if (!amount) {
            throw new BadRequestException(
                EXCHANGE_RATE_ERRORS.AMOUNT_MUST_BE_POSITIVE,
            );
        }

        let decimalAmount: Prisma.Decimal;

        try {
            decimalAmount = new Prisma.Decimal(amount);
        } catch {
            throw new BadRequestException(EXCHANGE_RATE_ERRORS.INVALID_AMOUNT);
        }

        if (decimalAmount.lessThanOrEqualTo(0)) {
            throw new BadRequestException(
                EXCHANGE_RATE_ERRORS.AMOUNT_MUST_BE_POSITIVE,
            );
        }

        if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
            throw new BadRequestException(
                EXCHANGE_RATE_ERRORS.AMOUNT_TOO_SMALL,
            );
        }

        const exchage = await this.getExchangeRate(from, to);

        const amountTo = new Prisma.Decimal(amount)
            .mul(new Prisma.Decimal(exchage.rate))
            .toFixed(2);

        return {
            amountFrom: amount,
            amountTo,
            exchangeRate: exchage.rate.toString(),
            from,
            to,
            rateDate: exchage.date,
            rateProvider: 'frankfurter',
        };
    }
}
