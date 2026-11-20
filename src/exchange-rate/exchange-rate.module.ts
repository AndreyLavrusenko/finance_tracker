import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';

@Module({
  providers: [ExchangeRateService]
})
export class ExchangeRateModule {}
