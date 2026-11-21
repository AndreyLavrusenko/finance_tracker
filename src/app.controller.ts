import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiHello } from './decorators/api-app.decorator';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiHello()
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
