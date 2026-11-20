export type CurrencyCode = 'RUB' | 'USD' | 'EUR';

export interface ExchangeRateResponse {
    date: string;
    base: CurrencyCode;
    quote: CurrencyCode;
    rate: number;
}

export interface FrankfurterRateResponse {
    date: string;
    base: CurrencyCode;
    quote: CurrencyCode;
    rate: number;
}

export interface ConversionResult {
    amountFrom: string;
    amountTo: string;
    exchangeRate: string;
    from: CurrencyCode;
    to: CurrencyCode;
    rateDate: string;
    rateProvider: string;
}
