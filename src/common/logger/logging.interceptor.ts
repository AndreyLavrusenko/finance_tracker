import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AppLoggerService } from './app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly loggerService: AppLoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const now = Date.now();

        const url = request.url;
        const method = request.method;
        const requestId = request.requestId;

        return next.handle().pipe(
            tap(() =>
                this.loggerService.log(
                    `[${requestId}] ${method} ${url} - ${
                        response.statusCode
                    } - ${Date.now() - now}ms`,
                    {
                        requestId,
                        method,
                        path: url,
                        statusCode: response.statusCode,
                        duration: Date.now() - now,
                    },
                ),
            ),
        );
    }
}
