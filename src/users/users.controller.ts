import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: { email: string; name: string },
  ): Promise<User> {
    return this.usersService.create(createUserDto);
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
  async remove(@Param('userId') userId: string): Promise<{ message: string }> {
    await this.usersService.remove(userId);
    return { message: 'Success' };
  }
}
