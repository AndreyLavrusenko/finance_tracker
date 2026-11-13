import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../auth';
import { CreateTransactionsDto } from './dto/create-transactions.dto';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Post()
    async create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateTransactionsDto,
    ) {
        return await this.transactionsService.create(user.id, dto);
    }

    @Get()
    async getAllTransactions(@CurrentUser() user: AuthUser) {
        return await this.transactionsService.getAllTransactions(user.id);
    }
}
