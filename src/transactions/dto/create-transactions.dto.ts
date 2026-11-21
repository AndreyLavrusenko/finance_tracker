import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';
import { TransactionType } from '../../common';

export class CreateTransactionsDto {
    @IsString()
    @Matches(/^[1-9]\d*$/)
    accountId: string;

    @IsString()
    @Matches(/^[1-9]\d*$/)
    categoryId: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    amount: number;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}
