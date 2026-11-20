export const EXCHANGE_RATE_ERRORS = {
    AMOUNT_MUST_BE_POSITIVE: 'Сумма конвертации должна быть больше 0',
    INVALID_AMOUNT: 'Некорректная сумма',
    AMOUNT_TOO_SMALL: 'Слишком маленькая сумма',
    UPSTREAM_RESPONSE_FAILED: 'Не удалось получить ответ от сервера',
    UPSTREAM_UNAVAILABLE: 'Внешний сервис недоступен',
} as const;
