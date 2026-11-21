import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common';

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

    @ApiProperty({ example: 'expense', enum: TransactionType })
    type: TransactionType;
}

export class TransactionViewResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: '120.00' })
    amount: string;

    @ApiProperty({ example: 'expense', enum: TransactionType })
    type: TransactionType;

    @ApiProperty({ example: 'Groceries', nullable: true })
    description: string | null;

    @ApiProperty({ example: '2026-11-20T10:00:00.000Z' })
    transaction_date: string;

    @ApiProperty({ type: TransactionAccountResponseDto })
    accounts: TransactionAccountResponseDto;

    @ApiProperty({ type: TransactionCategoryResponseDto })
    categories: TransactionCategoryResponseDto;
}
