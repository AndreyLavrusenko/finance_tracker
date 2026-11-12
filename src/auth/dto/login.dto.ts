import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @Length(5, 255)
    email: string;

    @IsString()
    @Length(8, 72)
    password: string;
}
