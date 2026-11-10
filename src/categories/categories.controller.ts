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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PositiveBigIntPipe } from '../common/pipes/positive-bigint.pipe';
import { PatchCategoryDto } from './dto/patch-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    async create(@Body() dto: CreateCategoryDto) {
        return await this.categoriesService.create(dto);
    }

    @Get()
    findUserCategories(@Query('userId', PositiveBigIntPipe) id: string) {
        return this.categoriesService.findUserCategories(id);
    }

    @Get(':categoryId')
    findCategory(@Param('categoryId', PositiveBigIntPipe) id: string) {
        return this.categoriesService.findCategory(id);
    }

    @Patch(':categoryId')
    updateCategory(
        @Param('categoryId', PositiveBigIntPipe) id: string,
        @Body() dto: PatchCategoryDto,
    ) {
        return this.categoriesService.updateCategory(id, dto);
    }

    @Delete(':categoryId')
    delete(@Param('categoryId', PositiveBigIntPipe) id: string) {
        return this.categoriesService.delete(id);
    }
}
