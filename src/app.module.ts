import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoDBModule } from './dynamodb/dynamodb.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { CalculationsModule } from './calculations/calculations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamoDBModule,
    UsersModule,
    CalculationsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
