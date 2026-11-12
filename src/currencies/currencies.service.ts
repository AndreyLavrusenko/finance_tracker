import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrenciesService {
    constructor(private readonly prismaService: PrismaService) {}

    async findAll() {
        return this.prismaService.currencies.findMany({
            orderBy: {
                code: 'desc',
            },
        });
    }

    findUnique(currencyId: string) {
        try {
            return this.prismaService.currencies.findUnique({
                where: {
                    id: BigInt(currencyId),
                },
            });
        } catch (error) {
            throw new NotFoundException('Указананя валюта не найдена');
        }
    }
}
