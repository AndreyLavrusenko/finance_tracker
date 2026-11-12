import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    @Length(5, 255)
    email: string;

    @IsString()
    @Length(8, 72)
    password: string;

    @IsString()
    @Length(2, 100)
    name: string;

    @IsString()
    @Matches(/^[1-9]\d*$/)
    baseCurrencyId: string;
}
