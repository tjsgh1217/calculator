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
    @Body() loginDto: { name: string; email: string },
    @Req() req: Request,
  ): Promise<{ success: boolean; user?: User }> {
    try {
      const users = await this.usersService.findAll();
      const user = users.find(
        (u) => u.name === loginDto.name && u.email === loginDto.email,
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
    @Body() createUserDto: { email: string; name: string },
  ): Promise<User | { error: string; userId?: undefined }> {
    const result = await this.usersService.create(createUserDto);

    if ('error' in result) {
      return { error: result.error };
    }

    return result;
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string): Promise<User | null> {
    return this.usersService.findOne(userId);
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
