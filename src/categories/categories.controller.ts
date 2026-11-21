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
import { ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PositiveBigIntPipe } from '../common/pipes/positive-bigint.pipe';
import { PatchCategoryDto } from './dto/patch-category.dto';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../auth';
import {
    ApiCreateCategory,
    ApiDeleteCategory,
    ApiGetCategories,
    ApiGetCategory,
    ApiUpdateCategory,
} from './decorators/api-categories.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @ApiCreateCategory()
    @Post()
    async create(
        @CurrentUser() user: AuthUser,
        @Body() dto: CreateCategoryDto,
    ) {
        return await this.categoriesService.create(user.id, dto);
    }

    @ApiGetCategories()
    @Get()
    findUserCategories(@CurrentUser() user: AuthUser) {
        return this.categoriesService.findUserCategories(user.id);
    }

    @ApiGetCategory()
    @Get(':categoryId')
    findCategory(
        @CurrentUser() user: AuthUser,
        @Param('categoryId', PositiveBigIntPipe) id: string,
    ) {
        return this.categoriesService.findCategory(user.id, id);
    }

    @ApiUpdateCategory()
    @Patch(':categoryId')
    updateCategory(
        @CurrentUser() user: AuthUser,
        @Param('categoryId', PositiveBigIntPipe) id: string,
        @Body() dto: PatchCategoryDto,
    ) {
        return this.categoriesService.updateCategory(user.id, id, dto);
    }

    @ApiDeleteCategory()
    @Delete(':categoryId')
    delete(
        @CurrentUser() user: AuthUser,
        @Param('categoryId', PositiveBigIntPipe) id: string,
    ) {
        return this.categoriesService.delete(user.id, id);
    }
}
