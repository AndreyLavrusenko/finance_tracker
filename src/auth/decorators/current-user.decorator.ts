import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth-user.interface';

export const CurrentUser = createParamDecorator((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    return user;
});
