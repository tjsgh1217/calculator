import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(
    @Body() loginDto: { id: string; password: string },
    @Req() req: Request,
  ): Promise<{ success: boolean; user?: User }> {
    try {
      const user = await this.usersService.validateUser(
        loginDto.id,
        loginDto.password,
      );

      if (user) {
        req.session['user'] = user;
        req.session['isLoggedIn'] = true;
        return { success: true, user };
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

  @Post('change-password')
  async changePassword(
    @Body() passwordData: { currentPassword: string; newPassword: string },
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = req.session['user'];
      if (!user || !user.userId) {
        return { success: false, message: '로그인이 필요합니다.' };
      }

      const result = await this.usersService.changePassword(
        user.userId,
        passwordData.currentPassword,
        passwordData.newPassword,
      );

      return result;
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      return {
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다.',
      };
    }
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string): Promise<User | null> {
    return this.usersService.findOne(userId);
  }

  @Get('session')
  getSession(@Req() req: Request) {
    if (!req.session || !req.session.isLoggedIn) {
      return {
        isLoggedIn: false,
        user: null,
      };
    }

    return {
      isLoggedIn: true,
      user: req.session.user || null,
    };
  }

  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: Partial<User>,
  ): Promise<User | null> {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete(':userId')
  async remove(
    @Param('userId') userId: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    await this.usersService.remove(userId);

    req.session.destroy((err) => {
      if (err) {
        console.error('세션 정리 중 오류 발생:', err);
      }
    });

    return { message: 'Success' };
  }
}
