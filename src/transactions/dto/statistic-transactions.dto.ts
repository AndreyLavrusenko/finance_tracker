import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

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
    dateTo?: string;
}
