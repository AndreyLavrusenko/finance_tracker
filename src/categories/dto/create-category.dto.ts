import { IsIn, IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @Length(2, 100)
    name: string;

    @IsIn(['income', 'expense'])
    type: 'income' | 'expense';

    @IsString()
    @Matches(/^[1-9]\d*$/)
    userId: string;
}
