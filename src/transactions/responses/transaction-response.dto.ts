import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: '1' })
    account_id: string;

    @ApiProperty({ example: '2' })
    category_id: string;

    @ApiProperty({ example: '120.00' })
    amount: string;

    @ApiProperty({ example: 'expense', enum: ['income', 'expense'] })
    type: 'income' | 'expense';

    @ApiProperty({ example: 'Groceries', nullable: true })
    description: string | null;

    @ApiProperty({ example: '2026-11-20T10:00:00.000Z' })
    transaction_date: string;

    @ApiProperty({ example: '2026-11-20T10:00:00.000Z' })
    created_at: string;
}
