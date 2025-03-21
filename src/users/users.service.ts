import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly tableName = 'cal_table';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(createUserDto: { email: string; name: string }): Promise<User> {
    const newUser: User = {
      userId: crypto.randomUUID(),
      ...createUserDto,
      createdAt: new Date(),
    };

    const userForDb = {
      ...newUser,
      createdAt: newUser.createdAt.toISOString(),
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
    return {
      userId: String(item.userId),
      email: String(item.email),
      name: String(item.name),
      createdAt:
        item.createdAt instanceof Date
          ? item.createdAt
          : new Date(item.createdAt),
    };
  }
}
