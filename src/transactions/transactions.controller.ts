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
import { ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../auth';
import { CreateTransactionsDto } from './dto/create-transactions.dto';
import { PatchTransactionsDto } from './dto/patch-transactions.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { StatisticTransactionsDto } from './dto/statistic-transactions.dto';
import {
    ApiCreateTransaction,
    ApiGetCategoryStatistics,
    ApiGetMonthStatistics,
    ApiGetTransaction,
    ApiGetTransactions,
    ApiGetTransactionStatistics,
    ApiUpdateTransaction,
} from './decorators/api-transactions.decorator';
import { PositiveBigIntPipe } from '../common/pipes/positive-bigint.pipe';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @ApiCreateTransaction()
    @Post()
    async create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateTransactionsDto,
    ) {
        return await this.transactionsService.create(user.id, dto);
    }

    @ApiGetTransactions()
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

    @ApiGetTransactionStatistics()
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

    @ApiGetCategoryStatistics()
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

    @ApiGetMonthStatistics()
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

    @ApiGetTransaction()
    @Get(':transactionId')
    async getTransactionById(
        @CurrentUser() user: AuthUser,
        @Param('transactionId', PositiveBigIntPipe) id: string,
    ) {
        return await this.transactionsService.getTransactionById(user.id, id);
    }

    @ApiUpdateTransaction()
    @Patch(':transactionId')
    async editTransactionById(
        @CurrentUser() user: AuthUser,
        @Param('transactionId', PositiveBigIntPipe) id: string,
        @Body() dto: PatchTransactionsDto,
    ) {
        return await this.transactionsService.editTransaction(user.id, id, dto);
    }

    //TODO: Delete method
}
