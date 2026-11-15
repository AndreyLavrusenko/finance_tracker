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
import { StatisticTransactionsDto } from './dto/statistic-transactions.dto';

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

    @Get('/statistics')
    async getTransactionStatistics(
        @CurrentUser() user: AuthUser,
        @Body() dto: StatisticTransactionsDto,
    ) {
        return await this.transactionsService.getTransactionStatistics(
            user.id,
            dto,
        );
    }

    @Get('/statistics/categories')
    async getTransactionStatisticsByCategories(
        @CurrentUser() user: AuthUser,
        @Body() dto: StatisticTransactionsDto,
    ) {
        return await this.transactionsService.getTransactionStatisticsByCategories(
            user.id,
            dto,
        );
    }

    @Get('/statistics/months')
    async getTransactionStatisticsByMonths(
        @CurrentUser() user: AuthUser,
        @Body() dto: StatisticTransactionsDto,
    ) {
        return await this.transactionsService.getTransactionStatisticsByMonths(
            user.id,
            dto,
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

    //TODO: Delete method
}
