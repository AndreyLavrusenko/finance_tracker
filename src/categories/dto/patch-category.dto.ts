import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { TransactionType } from '../../common';

export class PatchCategoryDto {
    @IsOptional()
    @IsString()
    @Length(2, 100)
    name?: string;

    @IsOptional()
    @IsEnum(TransactionType)
    type?: TransactionType;
}
