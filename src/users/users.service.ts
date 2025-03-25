import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly tableName = 'cal_table';
  private readonly USER_RECORD_TYPE = 'USER';
  private readonly validEmailDomains = [
    'gmail.com',
    'naver.com',
    'daum.net',
    'kakao.com',
    'nate.com',
  ];

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private validateEmailDomain(email: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!email || !email.includes('@')) {
      return { isValid: false, error: '유효하지 않은 이메일 형식입니다.' };
    }

    const localPart = email.split('@')[0];
    const localPartRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;

    if (!localPartRegex.test(localPart)) {
      return {
        isValid: false,
        error:
          '이메일은 영문자로 시작해야 하며, 영문자와 숫자만 포함할 수 있습니다.',
      };
    }

    const domain = email.split('@')[1];
    if (!this.validEmailDomains.includes(domain)) {
      return { isValid: false, error: '지원하지 않는 이메일 도메인입니다.' };
    }

    return { isValid: true };
  }

  private validateName(name: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!name || name.trim() === '') {
      return { isValid: false, error: '이름을 입력해주세요.' };
    }

    const nameRegex = /^[가-힣a-zA-Z]+$/;

    if (!nameRegex.test(name)) {
      return {
        isValid: false,
        error: '이름은 한글 또는 영문만 입력 가능합니다.',
      };
    }

    return { isValid: true };
  }

  async create(createUserDto: {
    email: string;
    name: string;
  }): Promise<User | { error: string }> {
    const nameValidation = this.validateName(createUserDto.name);
    if (!nameValidation.isValid) {
      return {
        error: nameValidation.error || '이름 검증에 실패했습니다.',
      };
    }

    try {
      const emailValidation = this.validateEmailDomain(createUserDto.email);
      if (!emailValidation.isValid) {
        return {
          error: emailValidation.error || '이메일 검증에 실패했습니다.',
        };
      }

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
    if (updateUserDto.name) {
      const nameValidation = this.validateName(updateUserDto.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.error || '이름 검증에 실패했습니다.');
      }
    }

    if (updateUserDto.email) {
      const emailValidation = this.validateEmailDomain(updateUserDto.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || '이메일 검증에 실패했습니다.');
      }
    }

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
