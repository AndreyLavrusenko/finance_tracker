import {
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';

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

    @IsIn(['income', 'expense'])
    type: 'income' | 'expense';

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}
