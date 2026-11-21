import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export const ApiHello = () =>
    applyDecorators(
        ApiOperation({ summary: 'Application greeting' }),
        ApiOkResponse({
            description: 'Hello World!',
            schema: { type: 'string', example: 'Hello World!' },
        }),
    );
