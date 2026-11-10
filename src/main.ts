import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

Object.defineProperty(BigInt.prototype, 'toJSON', {
    value(this: bigint) {
        return this.toString();
    },
    configurable: true,
});

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
    await app.listen(configService.get<number>('APP_PORT', 3000));

    app.enableShutdownHooks();
}
bootstrap();
