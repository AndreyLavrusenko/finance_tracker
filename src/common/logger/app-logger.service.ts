import { Injectable, Logger } from '@nestjs/common';
import { createLogger, format } from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');

interface LogContext {
    requestId?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
}

@Injectable()
export class AppLoggerService {
    private readonly logger = new Logger(AppLoggerService.name);
    private readonly filterLogger = createLogger({
        level: 'info',

        format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.json(),
        ),

        transports: [
            new DailyRotateFile({
                filename: 'logs/combined-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                level: 'info',
                maxSize: '20m',
                maxFiles: '14d',
            }),

            new DailyRotateFile({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    });

    log(message: string, context?: LogContext) {
        this.logger.log(message);
        this.filterLogger.info(message, { ...context });
    }

    warn(message: string, context?: LogContext) {
        this.logger.warn(message);
        this.filterLogger.warn(message, { ...context });
    }

    error(message: string, stack?: string, context?: LogContext) {
        this.logger.error(message);
        this.filterLogger.error(message, { stack }, { ...context });
    }
}
