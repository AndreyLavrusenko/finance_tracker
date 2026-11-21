import { ApiProperty } from '@nestjs/swagger';
import { TransactionViewResponseDto } from './transaction-view-response.dto';

export class TransactionListMetaResponseDto {
    @ApiProperty({ example: 42 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 5 })
    totalPages: number;
}

export class TransactionListResponseDto {
    @ApiProperty({ type: TransactionViewResponseDto, isArray: true })
    data: TransactionViewResponseDto[];

    @ApiProperty({ type: TransactionListMetaResponseDto })
    meta: TransactionListMetaResponseDto;
}
