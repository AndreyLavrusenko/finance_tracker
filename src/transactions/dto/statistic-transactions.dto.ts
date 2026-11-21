import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';
import { IsDateRangeValid } from '../../common';

export class StatisticTransactionsDto {
    @IsOptional()
    @IsString()
    @Matches(/^[1-9]\d*$/)
    accountId?: string;

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    @IsDateRangeValid('dateFrom')
    dateTo?: string;
}
