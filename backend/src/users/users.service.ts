import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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
  private readonly saltRounds = 10;

  constructor(private readonly dynamoDBService: DynamoDBService) {}

  private validateId(id: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!id || id.trim() === '') {
      return { isValid: false, error: 'ID를 입력해주세요.' };
    }

    const idRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;

    if (!idRegex.test(id)) {
      return {
        isValid: false,
        error:
          'ID는 영문자로 시작해야 하며, 영문자와 숫자만 포함할 수 있습니다.',
      };
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

  private validatePassword(password: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!password || password.length < 8) {
      return {
        isValid: false,
        error: '비밀번호는 최소 8자 이상이어야 합니다.',
      };
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLetter || !hasNumber || !hasSpecial) {
      return {
        isValid: false,
        error: '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
      };
    }

    return { isValid: true };
  }

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

  async create(createUserDto: {
    email: string;
    name: string;
    id: string;
    password: string;
  }): Promise<User | { error: string }> {
    const idValidation = this.validateId(createUserDto.id);
    if (!idValidation.isValid) {
      return {
        error: idValidation.error || 'ID 검증에 실패했습니다.',
      };
    }

    const passwordValidation = this.validatePassword(createUserDto.password);
    if (!passwordValidation.isValid) {
      return {
        error: passwordValidation.error || '비밀번호 검증에 실패했습니다.',
      };
    }

    const nameValidation = this.validateName(createUserDto.name);
    if (!nameValidation.isValid) {
      return {
        error: nameValidation.error || '이름 검증에 실패했습니다.',
      };
    }

    const emailValidation = this.validateEmailDomain(createUserDto.email);
    if (!emailValidation.isValid) {
      return {
        error: emailValidation.error || '이메일 검증에 실패했습니다.',
      };
    }

    try {
      const existingUsers = await this.findAll();
      const duplicateEmail = existingUsers.find(
        (user) => user.email === createUserDto.email,
      );

      if (duplicateEmail) {
        return { error: '이미 사용 중인 이메일입니다.' };
      }

      const duplicateId = existingUsers.find(
        (user) => user.id === createUserDto.id,
      );

      if (duplicateId) {
        return { error: '이미 사용 중인 ID입니다.' };
      }

      const now = new Date();
      const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);

      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.saltRounds,
      );

      const newUser: User = {
        userId: crypto.randomUUID(),
        calcId: this.USER_RECORD_TYPE,
        name: createUserDto.name,
        email: createUserDto.email,
        id: createUserDto.id,
        password: hashedPassword,
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

  async findById(id: string): Promise<User | null> {
    const users = await this.findAll();
    const user = users.find((user) => user.id === id);
    return user || null;
  }

  async findByName(name: string): Promise<User | null> {
    const users = await this.findAll();
    const user = users.find((user) => user.name === name);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll();
    const user = users.find((user) => user.email === email);
    return user || null;
  }

  async validateUser(id: string, password: string): Promise<User | null> {
    const user = await this.findById(id);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    return isPasswordValid ? user : null;
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

    if (updateUserDto.id) {
      const idValidation = this.validateId(updateUserDto.id);
      if (!idValidation.isValid) {
        throw new Error(idValidation.error || 'ID 검증에 실패했습니다.');
      }
    }

    if (updateUserDto.email) {
      const emailValidation = this.validateEmailDomain(updateUserDto.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || '이메일 검증에 실패했습니다.');
      }
    }

    if (updateUserDto.password) {
      const passwordValidation = this.validatePassword(updateUserDto.password);
      if (!passwordValidation.isValid) {
        throw new Error(
          passwordValidation.error || '비밀번호 검증에 실패했습니다.',
        );
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
    try {
      const result = await this.dynamoDBService.query(
        this.tableName,
        'userId = :userId',
        { ':userId': userId },
      );

      const items = result.Items || [];

      const deletePromises = items
        .filter((item) => item.calcId !== this.USER_RECORD_TYPE)
        .map((item) =>
          this.dynamoDBService.delete(this.tableName, item.userId, item.calcId),
        );

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }

      await this.dynamoDBService.delete(
        this.tableName,
        userId,
        this.USER_RECORD_TYPE,
      );

      console.log(`사용자(${userId})와 관련된 모든 데이터가 삭제되었습니다.`);
    } catch (error) {
      console.error(
        `사용자 및 관련 데이터 삭제 중 오류 발생 (userId: ${userId}):`,
        error,
      );
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.findOne(userId);

      if (!user) {
        return { success: false, message: '사용자를 찾을 수 없습니다.' };
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: '현재 비밀번호가 일치하지 않습니다.',
        };
      }

      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.error || '비밀번호 검증에 실패했습니다.',
        };
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);
      await this.update(userId, { password: hashedNewPassword });

      return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
      };
    } catch (error) {
      console.error('비밀번호 변경 중 오류 발생:', error);
      return {
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다.',
      };
    }
  }

  private mapToUser(item: Record<string, any>): User {
    return {
      userId: String(item.userId),
      calcId: String(item.calcId),
      name: String(item.name),
      email: String(item.email),
      id: String(item.id || ''),
      password: String(item.password || ''),
      createdAt: new Date(item.createdAt),
    };
  }
}
