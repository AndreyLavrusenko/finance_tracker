import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PositiveBigIntPipe implements PipeTransform<string, string> {
    transform(value: string): string {
        if (!/^[1-9]\d*$/.test(value)) {
            throw new BadRequestException(
                'ID должен быть положительным целым числом',
            );
        }

        const id = BigInt(value);

        // Максимальное значение PostgreSQL BIGINT
        if (id > 9223372036854775807n) {
            throw new BadRequestException('ID выходит за допустимый диапазон');
        }

        return value;
    }
}
