import { Module } from '@nestjs/common';
import { DynamoDBModule } from '../dynamodb/dynamodb.module';
import { CalculationsController } from './calculations.controller';
import { CalculationsService } from './calculations.service';

@Module({
  imports: [DynamoDBModule],
  controllers: [CalculationsController],
  providers: [CalculationsService],
  exports: [CalculationsService],
})
export class CalculationsModule {}
