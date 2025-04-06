import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CalculationsService } from './calculations/calculations.service';
import { JwtAuthGuard } from './users/jwt-auth.guard';
import { JwtPayload } from './types/user.interface';

@Controller()
export class AppController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @Get('signup')
  @Render('signup')
  getSignupPage() {
    return {
      message: 'Signup Page',
      path: '/signup',
      user: null,
      isLoggedIn: false,
    };
  }

  @Get('login')
  @Render('login')
  getLoginPage() {
    return {
      message: 'Login Page',
      path: '/login',
      user: null,
      isLoggedIn: false,
    };
  }

  @Get()
  @Render('home')
  root() {
    return {
      message: 'test',
      path: '/',
      user: null,
      isLoggedIn: false,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('mypage')
  @Render('mypage')
  getMyPage(@Req() req: Request) {
    return {
      message: 'My Page',
      path: '/mypage',
      user: req.user as string,
      isLoggedIn: true,
    };
  }

  @Get('logout')
  logout(@Res() res: Response) {
    res.redirect('/');
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @Render('history')
  async getHistoryPage(@Req() req: Request) {
    let history: { expression: string; result: string; createdAt: Date }[] = [];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const user = req.user as JwtPayload;
      if (user && user.sub) {
        // JwtPayload에서는 userId 대신 sub 사용
        history = await this.calculationsService.getCalculationHistory(
          user.sub,
        );
      }
    } catch (error) {
      console.error(
        'Error fetching calculation history:',
        error instanceof Error ? error.message : error,
      );
    }

    return {
      message: 'Calculation History',
      path: '/history',
      user: req.user as string,
      isLoggedIn: true,
      history,
    };
  }
}
