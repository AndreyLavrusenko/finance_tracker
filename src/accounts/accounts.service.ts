import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Prisma } from '../generated/prisma/client';
import { PatchAccountDto } from './dto/patch-account.dto';

@Injectable()
export class AccountsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: string, dto: CreateAccountDto) {
        const { name, type, currencyId } = dto;

        try {
            return await this.prismaService.accounts.create({
                data: {
                    name,
                    type,
                    currency_id: BigInt(currencyId),
                    user_id: BigInt(userId),
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new BadRequestException(
                        'Указан несуществующий пользователь или валюта',
                    );
                }

                if (error.code === 'P2002') {
                    throw new ConflictException(
                        'Дубликат уникального значения',
                    );
                }
            }

            throw error;
        }
    }

    async findAll(userId: string) {
        return await this.prismaService.accounts.findMany({
            where: {
                user_id: BigInt(userId),
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    async findOne(userId: string, accountId: string) {
        const account = await this.prismaService.accounts.findUnique({
            where: {
                id: BigInt(accountId),
                user_id: BigInt(userId),
            },
        });

        if (!account) {
            throw new NotFoundException('Счет не найден');
        }

        return account;
    }

    async update(userId: string, accountId: string, dto: PatchAccountDto) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException(
                'Укажите хотя бы одно поле для обновления',
            );
        }

        try {
            return await this.prismaService.accounts.update({
                where: {
                    id: BigInt(accountId),
                    user_id: BigInt(userId),
                },
                data: dto,
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException('Счет не найден');
            }

            throw error;
        }
    }

    async delete(userId: string, accountId: string) {
        try {
            return await this.prismaService.accounts.delete({
                where: {
                    id: BigInt(accountId),
                    user_id: BigInt(userId),
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException('Счет не найден');
            }

            throw error;
        }
    }
}
