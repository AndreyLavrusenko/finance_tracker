import { Injectable } from '@nestjs/common';
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
}
