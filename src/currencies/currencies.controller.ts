import { Controller, Get, Param } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { PositiveBigIntPipe } from '../common/pipes/positive-bigint.pipe';

@Controller('currencies')
export class CurrenciesController {
    constructor(private readonly currenciesService: CurrenciesService) {}

    @Get()
    async findAll() {
        return await this.currenciesService.findAll();
    }

    @Get(':id')
    findUnique(@Param('id', PositiveBigIntPipe) id: string) {
        return this.currenciesService.findUnique(id);
    }
}
