import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: '1' })
    user_id: string;

    @ApiProperty({ example: '1' })
    currency_id: string;

    @ApiProperty({ example: 'Cash' })
    name: string;

    @ApiProperty({ example: 'cash' })
    type: string;

    @ApiProperty({ example: '0.00' })
    balance: string;

    @ApiProperty({ example: '2026-11-20T10:00:00.000Z' })
    created_at: string;
}
