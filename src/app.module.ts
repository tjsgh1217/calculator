import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamoDBModule } from './dynamodb/dynamodb.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DynamoDBModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
