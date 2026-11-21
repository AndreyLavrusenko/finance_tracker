import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'Andrew' })
    name: string;

    @ApiProperty({ example: '1' })
    base_currency_id: string;

    @ApiProperty({ example: '2026-11-07T10:07:05.177Z' })
    created_at: string;
}
