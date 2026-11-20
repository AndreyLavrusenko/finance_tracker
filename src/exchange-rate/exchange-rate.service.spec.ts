import { EXCHANGE_RATE_ERRORS } from './exchange-rate.constants';
import { ExchangeRateService } from './exchange-rate.service';

describe('ExchangeRateService', () => {
    let service: ExchangeRateService;

    beforeEach(() => {
        service = new ExchangeRateService();
        jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return exchange rate from USD to RUB', async () => {
        const mockResponse = {
            date: '2026-11-20',
            base: 'USD',
            quote: 'RUB',
            rate: 82.5,
        };

        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        } as Response);

        const response = await service.getExchangeRate('USD', 'RUB');

        expect(response).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            'https://api.frankfurter.dev/v2/rate/USD/RUB',
        );
    });

    it('should return exchange rate from USD to EUR', async () => {
        const mockResponse = {
            date: '2026-11-20',
            base: 'USD',
            quote: 'EUR',
            rate: 0.91045,
        };

        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        } as Response);

        const response = await service.getExchangeRate('USD', 'EUR');

        expect(response).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            'https://api.frankfurter.dev/v2/rate/USD/EUR',
        );
    });

    it('should return exchange rate from RUB to RUB', async () => {
        const mockResponse = {
            date: '2026-11-20',
            base: 'RUB',
            quote: 'RUB',
            rate: 1,
        };

        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        } as Response);

        const response = await service.getExchangeRate('RUB', 'RUB');

        expect(response).toEqual(mockResponse);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should convert USD to RUB', async () => {
        jest.spyOn(service, 'getExchangeRate').mockResolvedValue({
            date: '2026-11-20',
            base: 'USD',
            quote: 'RUB',
            rate: 82.5,
        });

        const response = await service.convert('100', 'USD', 'RUB');

        expect(response.amountTo).toBe('8250.00');
    });

    it('should convert fractional amount', async () => {
        jest.spyOn(service, 'getExchangeRate').mockResolvedValue({
            date: '2026-11-20',
            base: 'USD',
            quote: 'RUB',
            rate: 82.5,
        });

        const response = await service.convert('0.1', 'USD', 'RUB');

        expect(response.amountTo).toBe('8.25');
    });

    it('should handle floating point precision', async () => {
        jest.spyOn(service, 'getExchangeRate').mockResolvedValue({
            date: '2026-11-20',
            base: 'USD',
            quote: 'RUB',
            rate: 0.2,
        });

        const response = await service.convert('0.3', 'USD', 'RUB');

        expect(response.amountTo).toBe('0.06');
    });

    it('should convert USD to USD', async () => {
        jest.spyOn(service, 'getExchangeRate').mockResolvedValue({
            date: '2026-11-20',
            base: 'USD',
            quote: 'USD',
            rate: 1,
        });

        const response = await service.convert('100', 'USD', 'USD');

        expect(response.amountTo).toBe('100.00');
    });

    it('should throw error when amount is zero', async () => {
        const getExchangeRateSpy = jest.spyOn(service, 'getExchangeRate');

        await expect(service.convert('0', 'USD', 'RUB')).rejects.toThrow(
            EXCHANGE_RATE_ERRORS.AMOUNT_MUST_BE_POSITIVE,
        );
        expect(getExchangeRateSpy).not.toHaveBeenCalled();
    });

    it('should throw error when amount is negative', async () => {
        const getExchangeRateSpy = jest.spyOn(service, 'getExchangeRate');

        await expect(service.convert('-220', 'USD', 'RUB')).rejects.toThrow(
            EXCHANGE_RATE_ERRORS.AMOUNT_MUST_BE_POSITIVE,
        );
        expect(getExchangeRateSpy).not.toHaveBeenCalled();
    });

    it('should throw error when amount is empty', async () => {
        const getExchangeRateSpy = jest.spyOn(service, 'getExchangeRate');

        await expect(service.convert('', 'USD', 'RUB')).rejects.toThrow(
            EXCHANGE_RATE_ERRORS.AMOUNT_MUST_BE_POSITIVE,
        );
        expect(getExchangeRateSpy).not.toHaveBeenCalled();
    });

    it('should throw error when amount is incorrect', async () => {
        const getExchangeRateSpy = jest.spyOn(service, 'getExchangeRate');

        await expect(service.convert('abc', 'USD', 'RUB')).rejects.toThrow(
            EXCHANGE_RATE_ERRORS.INVALID_AMOUNT,
        );
        expect(getExchangeRateSpy).not.toHaveBeenCalled();
    });

    it('should throw error when amount is incorrect', async () => {
        const getExchangeRateSpy = jest.spyOn(service, 'getExchangeRate');

        await expect(service.convert('10.2.3', 'USD', 'RUB')).rejects.toThrow(
            EXCHANGE_RATE_ERRORS.INVALID_AMOUNT,
        );
        expect(getExchangeRateSpy).not.toHaveBeenCalled();
    });

    it('should throw error when amount has more than 2 decimal places', async () => {
        await expect(service.convert('0.0001', 'USD', 'RUB')).rejects.toThrow(
            EXCHANGE_RATE_ERRORS.AMOUNT_TOO_SMALL,
        );
    });

    it('should accept amount with 2 decimal places', async () => {
        jest.spyOn(service, 'getExchangeRate').mockResolvedValue({
            date: '2026-11-20',
            base: 'USD',
            quote: 'RUB',
            rate: 82.5,
        });

        const response = await service.convert('10.25', 'USD', 'RUB');

        expect(response.amountTo).toBe('845.63');
    });
});
