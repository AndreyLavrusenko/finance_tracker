import { ApiProperty } from '@nestjs/swagger';

export class CurrencyResponseDto {
    @ApiProperty({ example: '1' })
    id: string;

    @ApiProperty({ example: 'RUB' })
    code: string;

    @ApiProperty({ example: 'Российский рубль' })
    name: string;

    @ApiProperty({ example: '₽' })
    symbol: string;

    @ApiProperty({ example: 2 })
    decimal_places: number;
}
