import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppLoggerService } from '../logger/app-logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly loggerService: AppLoggerService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const timestamp = new Date().toISOString();
        const path = request.url;
        const requestId = request.requestId;

        let status: number;
        let message: string | object;
        let logMessage: string;
        let stack: string | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            message = exception.getResponse();
            stack = exception.stack;

            logMessage = `[${requestId}] ${
                request.method
            } ${path} - ${status} ${JSON.stringify(message)}`;
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';

            const errorMessage =
                exception instanceof Error
                    ? exception.message
                    : String(exception);

            stack = exception instanceof Error ? exception.stack : undefined;

            logMessage = `[${requestId}] ${request.method} ${path} - ${status} ${errorMessage}`;
        }

        if (status >= 500) {
            this.loggerService.error(logMessage, stack);
        } else {
            this.loggerService.warn(logMessage);
        }

        response.status(status).json({
            statusCode: status,
            timestamp,
            path,
            requestId,
            message,
        });
    }
}
