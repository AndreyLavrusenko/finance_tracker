import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email',
    })
    @IsEmail()
    @Length(5, 255)
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'User password',
        format: 'password',
    })
    @IsString()
    @Length(8, 72)
    password: string;

    @IsString()
    @Length(2, 100)
    @ApiProperty({
        example: 'Andrew',
        description: 'Username',
    })
    name: string;

    @IsString()
    @Matches(/^[1-9]\d*$/)
    @ApiProperty({
        example: '1',
        description: "ID of the user's default currency",
    })
    baseCurrencyId: string;
}
