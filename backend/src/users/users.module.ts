import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DynamoDBService } from '../dynamodb/dynamodb.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtKey = configService.get<string>('JWT_KEY');
        return {
          secret: jwtKey || 'fallback-secret-key',
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, DynamoDBService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
