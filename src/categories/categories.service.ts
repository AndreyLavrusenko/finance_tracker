import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Prisma } from '../generated/prisma/client';
import { PatchCategoryDto } from './dto/patch-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: string, dto: CreateCategoryDto) {
        try {
            const { name, type } = dto;
            return await this.prismaService.categories.create({
                data: {
                    name,
                    type,
                    user_id: BigInt(userId),
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new BadRequestException('Пользователь не найден');
                }

                if (error.code === 'P2002') {
                    throw new ConflictException(
                        'Категория с таким названием уже существует',
                    );
                }
            }

            throw error;
        }
    }

    findUserCategories(userId: string) {
        return this.prismaService.categories.findMany({
            where: {
                user_id: BigInt(userId),
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    async findCategory(userId: string, categoryId: string) {
        const category = await this.prismaService.categories.findUnique({
            where: {
                id: BigInt(categoryId),
                user_id: BigInt(userId),
            },
        });

        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        return category;
    }

    async updateCategory(
        userId: string,
        categoryId: string,
        dto: PatchCategoryDto,
    ) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException(
                'Укажите хотя бы одно поле для обновления',
            );
        }

        try {
            return await this.prismaService.categories.update({
                where: {
                    id: BigInt(categoryId),
                    user_id: BigInt(userId),
                },
                data: dto,
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException('Категория не найдена');
            }

            throw error;
        }
    }

    async delete(userId: string, categoryId: string) {
        try {
            return await this.prismaService.categories.delete({
                where: {
                    id: BigInt(categoryId),
                    user_id: BigInt(userId),
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException('Категория не найдена');
                }

                if (error.code === 'P2003') {
                    throw new ConflictException(
                        'Нельзя удалить категорию, пока по ней есть транзакции',
                    );
                }
            }

            throw error;
        }
    }
}
