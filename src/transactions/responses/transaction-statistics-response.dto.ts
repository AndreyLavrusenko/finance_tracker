import { ApiProperty } from '@nestjs/swagger';

export class TransactionStatisticsResponseDto {
    @ApiProperty({ example: '5000.00' })
    income: string;

    @ApiProperty({ example: '1200.00' })
    expense: string;

    @ApiProperty({ example: '3800.00' })
    difference: string;
}

export class CategoryStatisticsResponseDto {
    @ApiProperty({ example: 'Food' })
    categoryName: string;

    @ApiProperty({ example: '1200.00' })
    amount: string;

    @ApiProperty({ example: 35 })
    percentage: number;
}

export class MonthStatisticsResponseDto {
    @ApiProperty({ example: '5000.00' })
    income: string;

    @ApiProperty({ example: '1200.00' })
    expense: string;

    @ApiProperty({ example: '3800.00' })
    difference: string;

    @ApiProperty({ example: '2026-11-01T00:00:00.000Z' })
    month: string;
}
