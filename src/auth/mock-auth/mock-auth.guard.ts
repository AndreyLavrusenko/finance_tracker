import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        request.user = {
            id: '1',
            email: 'lavrusenkoandrey@gmail.com',
        };

        return true;
    }
}
