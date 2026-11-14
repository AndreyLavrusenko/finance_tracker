import { Type } from 'class-transformer';
import {
    IsIn,
    IsOptional,
    IsString,
    Matches,
    IsDateString,
    IsInt,
    Min,
    Max,
} from 'class-validator';

export class GetTransactionsDto {
    @IsOptional()
    @IsString()
    @Matches(/^[1-9]\d*$/)
    accountId?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[1-9]\d*$/)
    categoryId?: string;

    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: 'income' | 'expense';

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
