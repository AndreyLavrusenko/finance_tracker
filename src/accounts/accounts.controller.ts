import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { PatchAccountDto } from './dto/patch-account.dto';
import { PositiveBigIntPipe } from '../common/pipes/positive-bigint.pipe';
import { AuthUser, CurrentUser, MockAuthGuard } from '../auth';

@UseGuards(MockAuthGuard)
@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

    @Post()
    async create(@CurrentUser() user: AuthUser, @Body() dto: CreateAccountDto) {
        return await this.accountsService.create(user.id, dto);
    }

    @Get()
    async findAll(@CurrentUser() user: AuthUser) {
        return this.accountsService.findAll(user.id);
    }

    @Get(':accountId')
    async findOne(
        @CurrentUser() user: AuthUser,
        @Param('accountId', PositiveBigIntPipe) id: string,
    ) {
        return this.accountsService.findOne(user.id, id);
    }

    @Patch(':accountId')
    async update(
        @CurrentUser() user: AuthUser,
        @Param('accountId', PositiveBigIntPipe) id: string,
        @Body() dto: PatchAccountDto,
    ) {
        return this.accountsService.update(user.id, id, dto);
    }

    @Delete(':accountId')
    async delete(
        @CurrentUser() user: AuthUser,
        @Param('accountId', PositiveBigIntPipe) id: string,
    ) {
        return this.accountsService.delete(user.id, id);
    }
}
