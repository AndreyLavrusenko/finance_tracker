import { IsEnum, IsString, Length } from 'class-validator';
import { TransactionType } from '../../common';

export class CreateCategoryDto {
    @IsString()
    @Length(2, 100)
    name: string;

    @IsEnum(TransactionType)
    type: TransactionType;
}
