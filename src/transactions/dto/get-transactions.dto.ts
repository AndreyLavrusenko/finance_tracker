import { Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    Matches,
    IsDateString,
    IsInt,
    Min,
    Max,
    IsEnum,
} from 'class-validator';
import { IsDateRangeValid, TransactionType } from '../../common';

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
    @IsEnum(TransactionType)
    type?: TransactionType;

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    @IsDateRangeValid('dateFrom')
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
