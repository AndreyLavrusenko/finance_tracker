import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../auth';
import { CreateTransactionsDto } from './dto/create-transactions.dto';
import { PatchTransactionsDto } from './dto/patch-transactions.dto';

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

    @Get(':transactionId')
    async getTransactionById(
        @CurrentUser() user: AuthUser,
        @Param('transactionId') id: string,
    ) {
        return await this.transactionsService.getTransactionById(user.id, id);
    }

    @Patch(':transactionId')
    async editTransactionById(
        @CurrentUser() user: AuthUser,
        @Param('transactionId') id: string,
        @Body() dto: PatchTransactionsDto,
    ) {
        return await this.transactionsService.editTransaction(user.id, id, dto);
    }
}
