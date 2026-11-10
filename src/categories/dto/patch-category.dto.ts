import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class PatchCategoryDto {
    @IsOptional()
    @IsString()
    @Length(2, 100)
    name?: string;

    @IsOptional()
    @IsIn(['income', 'expense'])
    type?: 'income' | 'expense';
}
