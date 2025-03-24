import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly tableName = 'cal_table';
  private readonly USER_RECORD_TYPE = 'USER';

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  async create(createUserDto: {
    email: string;
    name: string;
  }): Promise<User | { error: string }> {
    try {
      const existingUsers = await this.findAll();
      const duplicateEmail = existingUsers.find(
        (user) => user.email === createUserDto.email,
      );

      if (duplicateEmail) {
        return { error: '이미 사용 중인 이메일입니다.' };
      }
      const now = new Date();
      const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

      const newUser: User = {
        userId: crypto.randomUUID(),
        calcId: this.USER_RECORD_TYPE,
        ...createUserDto,
        createdAt: kstTime,
      };

      const userForDb = {
        ...newUser,
        createdAt: kstTime.toISOString(),
      };

      await this.dynamoDBService.put(this.tableName, userForDb);
      return newUser;
    } catch (error) {
      console.error('사용자 생성 실패:', error);
      return { error: '회원가입 중 오류가 발생했습니다.' };
    }
  }

  async findAll(): Promise<User[]> {
    const result = await this.dynamoDBService.scan(this.tableName);
    return (result.Items || [])
      .filter((item) => item.calcId === this.USER_RECORD_TYPE)
      .map((item) => this.mapToUser(item));
  }

  async findOne(userId: string): Promise<User | null> {
    const result = await this.dynamoDBService.get(
      this.tableName,
      userId,
      this.USER_RECORD_TYPE,
    );
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
      userId,
      this.USER_RECORD_TYPE,
      `SET ${updateExpression}`,
      expressionAttributeValues,
      expressionAttributeNames,
    );

    return result.Attributes ? this.mapToUser(result.Attributes) : null;
  }

  async remove(userId: string): Promise<void> {
    await this.dynamoDBService.delete(
      this.tableName,
      userId,
      this.USER_RECORD_TYPE,
    );
  }

  private mapToUser(item: Record<string, any>): User {
    return {
      userId: String(item.userId),
      calcId: String(item.calcId),
      name: String(item.name),
      email: String(item.email),
      createdAt: new Date(item.createdAt),
    };
  }
}
