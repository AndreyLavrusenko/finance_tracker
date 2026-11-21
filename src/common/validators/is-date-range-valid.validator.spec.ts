import { IsDateString, IsOptional, validate } from 'class-validator';
import { IsDateRangeValid } from './is-date-range-valid.validator';

class EventDto {
    @IsDateString()
    @IsOptional()
    dateFrom?: string;

    @IsDateString()
    @IsOptional()
    @IsDateRangeValid('dateFrom')
    dateTo?: string;
}

describe('is-date-range-valid decorator', () => {
    it('Должен пропускать валидацию, если dateTo позже dateFrom', async () => {
        const dto = new EventDto();
        dto.dateFrom = '2026-11-20';
        dto.dateTo = '2026-11-21';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('Должен пропускать валидацию, если dateTo равен dateFrom', async () => {
        const dto = new EventDto();
        dto.dateFrom = '2026-11-20';
        dto.dateTo = '2026-11-20';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('Должен возвращать ошибку, если dateTo раньше dateFrom', async () => {
        const dto = new EventDto();
        dto.dateFrom = '2026-11-20';
        dto.dateTo = '2026-11-19';

        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('dateTo');
        expect(errors[0].constraints).toEqual({
            isDateRangeValid:
                'dateTo must be greater than or equal to dateFrom',
        });
    });

    it('Должен проходить если передано только одно значение', async () => {
        const dto = new EventDto();
        dto.dateFrom = '2026-11-20';

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });

    it('Должен проходить если ничего не передано', async () => {
        const dto = new EventDto();

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
    });
});
