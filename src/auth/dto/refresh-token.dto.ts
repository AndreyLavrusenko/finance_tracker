import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIs...',
        description: 'JWT refresh token',
    })
    @IsString()
    @Matches(/^[0-9a-f]{128}$/)
    refreshToken: string;
}
