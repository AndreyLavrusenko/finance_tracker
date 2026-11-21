import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common';

export class CategoryResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: '1' })
    user_id: string;

    @ApiProperty({ example: 'Food' })
    name: string;

    @ApiProperty({ example: 'expense', enum: TransactionType })
    type: TransactionType;

    @ApiProperty({ example: '2026-11-20T10:00:00.000Z' })
    created_at: string;
}
