import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(
    @Body() loginDto: { id: string; password: string },
  ): Promise<{ success: boolean; access_token?: string; user?: User }> {
    try {
      const result = await this.usersService.login(
        loginDto.id,
        loginDto.password,
      );
      console.log(loginDto.id, loginDto.password);

      if (result.user) {
        return {
          success: true,
          access_token: result.access_token,
          user: result.user,
        };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  }

  @Post()
  async create(
    @Body()
    createUserDto: {
      email: string;
      name: string;
      id: string;
      password: string;
    },
  ): Promise<User | { error: string; userId?: undefined }> {
    const result = await this.usersService.create(createUserDto);

    if ('error' in result) {
      return { error: result.error };
    }

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() passwordData: { currentPassword: string; newPassword: string },
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string; requireRelogin?: boolean }> {
    try {
      const user = req.user as { userId: string; username: string };
      if (!user || !user.userId) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const result = await this.usersService.changePassword(
        user.userId,
        passwordData.currentPassword,
        passwordData.newPassword,
      );

      if (result.success) {
        return {
          ...result,
          requireRelogin: true,
        };
      }

      return result;
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      return {
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다.',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      isLoggedIn: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async findOne(@Param('userId') userId: string): Promise<User | null> {
    return this.usersService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User | null> {
    return this.usersService.update(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async remove(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.usersService.remove(userId);
    return { message: 'Success' };
  }
}
