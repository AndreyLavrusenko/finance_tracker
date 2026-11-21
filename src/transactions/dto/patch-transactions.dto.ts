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

export class PatchTransactionsDto {
    @IsOptional()
    @IsString()
    @Matches(/^[1-9]\d*$/)
    categoryId?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    amount?: number;

    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}
