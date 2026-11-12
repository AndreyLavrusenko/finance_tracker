import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../auth';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    getProfile(@CurrentUser() user: AuthUser) {
        return this.userService.getProfile(user.id);
    }

    @Put()
    updateName(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
        return this.userService.updateName(user.id, dto);
    }

    @Delete()
    delete(@CurrentUser() user: AuthUser) {
        return this.userService.delete(user.id);
    }
}
