import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    let currencyId: bigint;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = app.get(PrismaService);

        const currency = await prisma.currencies.upsert({
            where: { code: 'RUB' },
            update: {},
            create: {
                code: 'RUB',
                name: 'Российский рубль',
                symbol: '₽',
            },
        });

        currencyId = currency.id;
    });

    afterEach(async () => {
        await prisma.users.deleteMany({
            where: {
                email: 'auth-test@example.com',
            },
        });
    });

    afterAll(async () => {
        await app.close();
    });

    it('should register a new user', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'auth-test@example.com',
                password: 'password123',
                name: 'Test User',
                baseCurrencyId: currencyId.toString(),
            })
            .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');

        expect(response.body.user.email).toBe('auth-test@example.com');
        expect(response.body.user.name).toBe('Test User');
        expect(response.body.user).not.toHaveProperty('password_hash');

        const newUser = await prisma.users.findUnique({
            where: {
                id: response.body.user.id,
            },
        });

        expect(newUser).not.toBeNull();
        expect(newUser.password_hash).not.toBe('password123');

        expect(await bcrypt.compare('password123', newUser.password_hash)).toBe(
            true,
        );
    });

    it('register one user twice', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'auth-test@example.com',
                password: 'password123',
                name: 'Test User',
                baseCurrencyId: currencyId.toString(),
            })
            .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');

        expect(response.body.user.email).toBe('auth-test@example.com');
        expect(response.body.user.name).toBe('Test User');
        expect(response.body.user).not.toHaveProperty('password_hash');

        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'auth-test@example.com',
                password: 'password123',
                name: 'Test User',
                baseCurrencyId: currencyId.toString(),
            })
            .expect(409);

        const usersCount = await prisma.users.count({
            where: {
                email: 'auth-test@example.com',
            },
        });

        expect(usersCount).toBe(1);
    });

    it('should login with correct credentials', async () => {
        const user = {
            email: 'auth-test@example.com',
            password: 'password123',
            name: 'Test User',
            baseCurrencyId: currencyId.toString(),
        };

        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: user.email,
                password: user.password,
            })
            .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');

        expect(response.body.user.email).toBe(user.email);
        expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('login with wrong password and email', async () => {
        const user = {
            email: 'auth-test@example.com',
            password: 'password123',
            name: 'Test User',
            baseCurrencyId: currencyId.toString(),
        };

        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: user.email,
                password: 'wrong password',
            })
            .expect(401);

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'awegaweg@mail.ru',
                password: user.password,
            })
            .expect(401);
    });

    it('should handle full authentication lifecycle', async () => {
        const user = {
            email: 'auth-test@example.com',
            password: 'password123',
            name: 'Test User',
            baseCurrencyId: currencyId.toString(),
        };

        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');

        expect(response.body.user.email).toBe(user.email);
        expect(response.body.user.name).toBe(user.name);
        expect(response.body.user).not.toHaveProperty('password_hash');

        const refreshToken = response.body.refreshToken;

        const tokenResponse = await request(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken })
            .expect(201);

        expect(tokenResponse.body).toHaveProperty('refreshToken');
        expect(tokenResponse.body).toHaveProperty('accessToken');

        expect(refreshToken).not.toBe(tokenResponse.body.refreshToken);

        await request(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken })
            .expect(401);

        const logoutResponse = await request(app.getHttpServer())
            .post('/auth/logout')
            .send({ refreshToken: tokenResponse.body.refreshToken })
            .expect(201);

        expect(logoutResponse.body.success).toBe(true);

        await request(app.getHttpServer())
            .post('/auth/refresh')
            .send({ refreshToken: tokenResponse.body.refreshToken })
            .expect(401);
    });

    it('should access protected route with valid access token', async () => {
        const user = {
            email: 'auth-test@example.com',
            password: 'password123',
            name: 'Test User',
            baseCurrencyId: currencyId.toString(),
        };

        const registerResponse = await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        const accessToken = registerResponse.body.accessToken;

        const response = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body).toEqual({
            id: registerResponse.body.user.id,
            email: user.email,
        });
    });
});
