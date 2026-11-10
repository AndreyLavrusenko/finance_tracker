import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAccountDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    @MinLength(1)
    @MaxLength(20)
    type: string;

    @IsString()
    @Matches(/^[1-9]\d*$/)
    currencyId: string;

    @IsString()
    @Matches(/^[1-9]\d*$/)
    userId: string;
}
