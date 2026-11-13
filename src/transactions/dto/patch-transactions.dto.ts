import {
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';

export class PatchTransactions {
    @IsOptional()
    @IsString()
    @Matches(/^[1-9]\d*$/)
    categoryId?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    amount?: number;

    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: 'income' | 'expense';

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string;
}
