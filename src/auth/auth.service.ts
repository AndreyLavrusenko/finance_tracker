import { AuthUser } from './interfaces/auth-user.interface';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrenciesService } from '../currencies/currencies.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { randomBytes, createHash } from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly currencyService: CurrenciesService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const { email, password, name, baseCurrencyId } = dto;
        const user = await this.prismaService.users.findUnique({
            where: {
                email,
            },
        });

        if (user) {
            throw new ConflictException('Такой пользователь уже существует');
        }

        const currency = await this.currencyService.findUnique(baseCurrencyId);

        if (!currency) {
            throw new NotFoundException('Указананя валюта не найдена');
        }

        const hash = await bcrypt.hash(password, 10);

        try {
            const createdUser = await this.prismaService.users.create({
                data: {
                    email,
                    name,
                    password_hash: hash,
                    base_currency_id: BigInt(baseCurrencyId),
                },
            });

            const { password_hash, ...cleanUser } = createdUser;

            const { accessToken, refreshToken } = await this.generateTokens({
                id: createdUser.id.toString(),
                email,
            });

            return {
                user: cleanUser,
                accessToken,
                refreshToken,
            };
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException(
                        'Дубликат уникального значения',
                    );
                }

                if (error.code === 'P2003') {
                    throw new BadRequestException(
                        'Указанная валюта не существует',
                    );
                }
            }

            throw error;
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prismaService.users.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        const isPasswordCorrect = await bcrypt.compare(
            dto.password,
            user.password_hash,
        );

        if (!isPasswordCorrect) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }

        const { accessToken, refreshToken } = await this.generateTokens({
            id: user.id.toString(),
            email: user.email,
        });

        const { password_hash, ...cleanUser } = user;

        return {
            user: cleanUser,
            accessToken,
            refreshToken,
        };
    }

    async logout(dto: RefreshTokenDto) {
        const tokenHash = this.hashRefreshToken(dto.refreshToken);

        const result = await this.prismaService.refresh_tokens.updateMany({
            where: {
                token_hash: tokenHash,
                revoked_at: null,
            },
            data: {
                revoked_at: new Date(),
            },
        });

        return {
            success: result.count > 0,
        };
    }

    async refresh(dto: RefreshTokenDto) {
        const tokenHash = this.hashRefreshToken(dto.refreshToken);

        const token = await this.prismaService.refresh_tokens.findUnique({
            where: {
                token_hash: tokenHash,
            },
            include: {
                users: true,
            },
        });

        if (!token) {
            throw new UnauthorizedException('Недействительный токен');
        }

        if (
            token.revoked_at !== null ||
            token.expires_at.getTime() <= Date.now()
        ) {
            throw new UnauthorizedException('Недействительный токен');
        }

        return this.prismaService.$transaction(async (tx) => {
            const result = await tx.refresh_tokens.updateMany({
                where: {
                    id: token.id,
                    revoked_at: null,
                    expires_at: {
                        gt: new Date(),
                    },
                },
                data: {
                    revoked_at: new Date(),
                },
            });

            if (result.count === 0) {
                throw new UnauthorizedException('Недействительный токен');
            }

            return this.generateTokens(
                {
                    id: token.users.id.toString(),
                    email: token.users.email,
                },
                tx,
            );
        });
    }

    private async generateTokens(
        user: AuthUser,
        tx: Prisma.TransactionClient = this.prismaService,
    ) {
        const refreshToken = this.generateRefreshToken();
        const refreshHashToken = this.hashRefreshToken(refreshToken);

        const expireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await tx.refresh_tokens.create({
            data: {
                user_id: BigInt(user.id),
                token_hash: refreshHashToken,
                expires_at: expireDate,
            },
        });

        const accessToken = await this.generateAccessToken(user);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async generateAccessToken(user: AuthUser) {
        const payload = {
            sub: user.id,
            email: user.email,
        };

        const token = await this.jwtService.signAsync(payload);

        return token;
    }

    private hashRefreshToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }

    private generateRefreshToken() {
        return randomBytes(64).toString('hex');
    }
}
