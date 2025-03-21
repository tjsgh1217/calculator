import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DynamoDBService } from '../dynamodb/dynamodb.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, DynamoDBService],
})
export class UsersModule {}
