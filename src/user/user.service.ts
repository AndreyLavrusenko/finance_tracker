import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async getProfile(userId: string) {
        const user = await this.prismaService.users.findUnique({
            where: {
                id: BigInt(userId),
            },
        });

        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        return this.toProfile(user);
    }

    async updateName(userId: string, dto: UpdateUserDto) {
        try {
            const user = await this.prismaService.users.update({
                where: {
                    id: BigInt(userId),
                },
                data: {
                    name: dto.name,
                },
            });

            return this.toProfile(user);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException('Пользователь не найден');
            }

            throw error;
        }
    }

    async delete(userId: string) {
        const id = BigInt(userId);

        try {
            const user = await this.prismaService.$transaction(async (tx) => {
                const accounts = await tx.accounts.findMany({
                    where: { user_id: id },
                    select: { id: true },
                });
                const categories = await tx.categories.findMany({
                    where: { user_id: id },
                    select: { id: true },
                });

                const accountIds = accounts.map((account) => account.id);
                const categoryIds = categories.map((category) => category.id);

                if (accountIds.length > 0) {
                    await tx.transfers.deleteMany({
                        where: {
                            OR: [
                                { from_account_id: { in: accountIds } },
                                { to_account_id: { in: accountIds } },
                            ],
                        },
                    });
                }

                const transactionFilters = [
                    accountIds.length > 0
                        ? { account_id: { in: accountIds } }
                        : undefined,
                    categoryIds.length > 0
                        ? { category_id: { in: categoryIds } }
                        : undefined,
                ].filter((filter) => filter !== undefined);

                if (transactionFilters.length > 0) {
                    await tx.transactions.deleteMany({
                        where: {
                            OR: transactionFilters,
                        },
                    });
                }

                await tx.accounts.deleteMany({ where: { user_id: id } });
                await tx.categories.deleteMany({ where: { user_id: id } });
                await tx.refresh_tokens.deleteMany({ where: { user_id: id } });

                return tx.users.delete({ where: { id } });
            });

            return this.toProfile(user);
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException('Пользователь не найден');
            }

            throw error;
        }
    }

    private toProfile<T extends { password_hash: string }>(user: T) {
        const { password_hash, ...profile } = user;

        return profile;
    }
}
