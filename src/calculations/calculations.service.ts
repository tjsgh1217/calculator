import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';

@Injectable()
export class CalculationsService {
  private readonly tableName = 'cal_table';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async saveCalculation(calculationData: {
    userId: string;
    calcId: string;
    expression: string;
    result: string;
    createdAt: Date;
  }): Promise<void> {
    try {
      const kstDate = new Date(calculationData.createdAt);
      kstDate.setHours(kstDate.getHours() + 9);

      const calculationDataWithISODate = {
        ...calculationData,
        createdAt: kstDate.toISOString(),
      };

      await this.dynamoDBService.put(
        this.tableName,
        calculationDataWithISODate,
      );
    } catch (error) {
      console.error('계산을 저장하는 중 오류 발생:', error);
      throw new Error('DynamoDB에 계산을 저장하는데 실패');
    }
  }

  async getCalculationHistory(
    userId: string,
  ): Promise<{ expression: string; result: string; createdAt: Date }[]> {
    try {
      const result = await this.dynamoDBService.scan(this.tableName, {
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      });

      return result.Items
        ? result.Items.map((item) => {
            const incorrectDate = new Date(item.createdAt);
            const correctedDate = new Date(
              incorrectDate.getTime() - 9 * 60 * 60 * 1000,
            );

            return {
              expression: item.expression as string,
              result: item.result as string,
              createdAt: correctedDate,
            };
          })
            .filter((item) => item.expression && item.result)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        : [];
    } catch (error) {
      console.error('계산 기록을 가져오는 중 오류 발생:', error);
      throw new Error('계산 기록을 가져오는데 실패');
    }
  }
}
