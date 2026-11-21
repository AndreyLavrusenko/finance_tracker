import { ApiProperty } from '@nestjs/swagger';

export class TransactionAccountResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: 'Cash' })
    name: string;

    @ApiProperty({ example: 'cash' })
    type: string;
}

export class TransactionCategoryResponseDto {
    @ApiProperty({ example: '2' })
    id: string;

    @ApiProperty({ example: 'Food' })
    name: string;

    @ApiProperty({ example: 'expense', enum: ['income', 'expense'] })
    type: 'income' | 'expense';
}

export class TransactionViewResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: '120.00' })
    amount: string;

    @ApiProperty({ example: 'expense', enum: ['income', 'expense'] })
    type: 'income' | 'expense';

    @ApiProperty({ example: 'Groceries', nullable: true })
    description: string | null;

    @ApiProperty({ example: '2026-11-20T10:00:00.000Z' })
    transaction_date: string;

    @ApiProperty({ type: TransactionAccountResponseDto })
    accounts: TransactionAccountResponseDto;

    @ApiProperty({ type: TransactionCategoryResponseDto })
    categories: TransactionCategoryResponseDto;
}
