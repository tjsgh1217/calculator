import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CalculationsService } from './calculations.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { JwtPayload } from '../types/user.interface';

@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async saveCalculation(
    @Body() data: { expression: string; result: string },
    @Req() req: Request,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const user = req.user as JwtPayload;
      if (!user || !user.userId) {
        return { success: false, message: '사용자 ID를 찾을 수 없습니다' };
      }

      const calcId = uuidv4();

      await this.calculationsService.saveCalculation({
        userId: user.userId,
        calcId,
        expression: data.expression,
        result: data.result,
        createdAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '계산 기록 저장 중 오류가 발생했습니다',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Req() req: Request): Promise<any> {
    try {
      const user = req.user as JwtPayload;
      if (!user || !user.userId) {
        return { success: false, message: '사용자 ID를 찾을 수 없습니다' };
      }

      const history = await this.calculationsService.getCalculationHistory(
        user.userId,
      );
      return { success: true, history };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '계산 기록 조회 중 오류가 발생했습니다',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:calcId')
  async deleteCalculation(
    @Param('calcId') calcId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const user = req.user as JwtPayload;
      if (!user || !user.userId) {
        return { success: false, message: '사용자 ID를 찾을 수 없습니다' };
      }

      await this.calculationsService.deleteCalculation(user.userId, calcId);
      return { success: true, message: '계산 기록이 삭제되었습니다' };
    } catch (error) {
      console.error('계산 기록 삭제 중 오류:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : '계산 기록 삭제 중 오류가 발생했습니다',
      };
    }
  }
}
