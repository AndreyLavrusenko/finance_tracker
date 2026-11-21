import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthUser } from './interfaces/auth-user.interface';
import {
    ApiGetMe,
    ApiLogin,
    ApiRefresh,
    ApiRegister,
} from './decorators/api-auth.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiRegister()
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @ApiLogin()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @ApiRefresh()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto);
    }

    @Post('logout')
    logout(@Body() dto: RefreshTokenDto) {
        return this.authService.logout(dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiGetMe()
    @Get('me')
    getMe(@CurrentUser() user: AuthUser) {
        return this.authService.getMe(user.id);
    }
}
