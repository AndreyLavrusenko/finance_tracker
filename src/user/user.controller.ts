import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../auth';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    ApiDeleteProfile,
    ApiGetProfile,
    ApiUpdateProfile,
} from './decorators/api-user.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiGetProfile()
    @Get()
    getProfile(@CurrentUser() user: AuthUser) {
        return this.userService.getProfile(user.id);
    }

    @ApiUpdateProfile()
    @Put()
    updateName(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
        return this.userService.updateName(user.id, dto);
    }

    @ApiDeleteProfile()
    @Delete()
    delete(@CurrentUser() user: AuthUser) {
        return this.userService.delete(user.id);
    }
}
