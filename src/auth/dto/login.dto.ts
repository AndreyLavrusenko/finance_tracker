import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
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
}
