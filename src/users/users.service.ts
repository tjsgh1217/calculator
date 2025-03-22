import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly tableName = 'cal_table';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(createUserDto: { email: string; name: string }): Promise<User> {
    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    const newUser: User = {
      userId: crypto.randomUUID(),
      ...createUserDto,
      createdAt: kstTime,
    };

    const userForDb = {
      ...newUser,
      createdAt: kstTime.toISOString(),
    };

    await this.dynamoDBService.put(this.tableName, userForDb);
    return newUser;
  }

  async findAll(): Promise<User[]> {
    const result = await this.dynamoDBService.scan(this.tableName);
    return (result.Items || []).map((item) => this.mapToUser(item));
  }

  async findOne(userId: string): Promise<User | null> {
    const result = await this.dynamoDBService.get(this.tableName, { userId });
    return result.Item ? this.mapToUser(result.Item) : null;
  }

  async update(
    userId: string,
    updateUserDto: Partial<User>,
  ): Promise<User | null> {
    const updateExpression = Object.keys(updateUserDto)
      .map((k, i) => `#key${i} = :value${i}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updateUserDto).reduce<
      Record<string, string>
    >(
      (acc, k, i) => ({
        ...acc,
        [`#key${i}`]: k,
      }),
      {},
    );

    const expressionAttributeValues = Object.keys(updateUserDto).reduce<
      Record<string, any>
    >(
      (acc, k, i) => ({
        ...acc,
        [`:value${i}`]: updateUserDto[k as keyof typeof updateUserDto],
      }),
      {},
    );

    const result = await this.dynamoDBService.update(
      this.tableName,
      { userId },
      `SET ${updateExpression}`,
      expressionAttributeValues,
      expressionAttributeNames,
    );

    return result.Attributes ? this.mapToUser(result.Attributes) : null;
  }

  async remove(userId: string): Promise<void> {
    await this.dynamoDBService.delete(this.tableName, { userId });
  }

  private mapToUser(item: Record<string, any>): User {
    const createdAt = new Date(item.createdAt);
    const kstTime = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000);

    return {
      userId: String(item.userId),
      email: String(item.email),
      name: String(item.name),
      createdAt: kstTime,
    };
  }
}
