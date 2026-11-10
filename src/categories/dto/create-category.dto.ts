import { IsIn, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @Length(2, 100)
    name: string;

    @IsIn(['income', 'expense'])
    type: 'income' | 'expense';
}
