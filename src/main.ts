import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

Object.defineProperty(BigInt.prototype, 'toJSON', {
    value(this: bigint) {
        return this.toString();
    },
    configurable: true,
});

const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Finance Tracker API')
        .setDescription('API documentation for Finance Tracker')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const configService = app.get(ConfigService);

    setupSwagger(app);

    await app.listen(configService.get<number>('APP_PORT', 3000));

    app.enableShutdownHooks();
}
bootstrap();
