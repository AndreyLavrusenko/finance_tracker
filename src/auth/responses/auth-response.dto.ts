import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIs...',
        description: 'JWT access token',
    })
    accessToken: string;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIs...',
        description: 'JWT refresh token',
    })
    refreshToken: string;
}
