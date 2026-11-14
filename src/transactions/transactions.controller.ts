import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../auth';
import { CreateTransactionsDto } from './dto/create-transactions.dto';
import { PatchTransactionsDto } from './dto/patch-transactions.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';

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
    async getAllTransactions(
        @CurrentUser() user: AuthUser,
        @Query() filters: GetTransactionsDto,
    ) {
        return await this.transactionsService.getAllTransactions(
            user.id,
            filters,
        );
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
