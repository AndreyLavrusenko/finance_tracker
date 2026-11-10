import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { PatchAccountDto } from './dto/patch-account.dto';
import { PositiveBigIntPipe } from '../common/pipes/positive-bigint.pipe';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    async create(@Body() dto: CreateAccountDto) {
        return await this.accountsService.create(dto);
    }

    @Get()
    async findAll(@Query('userId', PositiveBigIntPipe) userId: string) {
        return this.accountsService.findAll(userId);
    }

    @Get(':accountId')
    async findOne(@Param('accountId', PositiveBigIntPipe) id: string) {
        return this.accountsService.findOne(id);
    }

    @Patch(':accountId')
    async update(
        @Param('accountId', PositiveBigIntPipe) id: string,
        @Body() dto: PatchAccountDto,
    ) {
        return this.accountsService.update(id, dto);
    }

    @Delete(':accountId')
    async delete(@Param('accountId', PositiveBigIntPipe) id: string) {
        return this.accountsService.delete(id);
    }
}
