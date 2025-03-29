import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CalculationsService } from './calculations/calculations.service';

@Controller()
export class AppController {
  @Get('signup')
  @Render('signup')
  getSignupPage(@Req() req: Request) {
    return {
      message: 'Signup Page',
      path: '/signup',
      user: req.session.user || null,
      isLoggedIn: req.session.isLoggedIn || false,
    };
  }

  @Get('login')
  @Render('login')
  getLoginPage(@Req() req: Request) {
    return {
      message: 'Login Page',
      path: '/login',
      user: req.session.user || null,
      isLoggedIn: req.session.isLoggedIn || false,
    };
  }

  @Get()
  @Render('home')
  root(@Req() req: Request) {
    return {
      message: 'test',
      path: '/',
      user: req.session.user || null,
      isLoggedIn: req.session.isLoggedIn || false,
    };
  }

  @Get('mypage')
  @Render('mypage')
  getMyPage(@Req() req: Request, @Res() res: Response) {
    if (!req.session.isLoggedIn) {
      return res.redirect('/login');
    }
    return {
      message: 'My Page',
      path: '/mypage',
      user: req.session.user || null,
      isLoggedIn: req.session.isLoggedIn || false,
    };
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  }

  constructor(private readonly calculationsService: CalculationsService) {}

  @Get('history')
  @Render('history')
  async getHistoryPage(@Req() req: Request) {
    const isLoggedIn = req.session.isLoggedIn || false;

    let history: { expression: string; result: string; createdAt: Date }[] = [];
    if (isLoggedIn && req.session.user) {
      try {
        history = await this.calculationsService.getCalculationHistory(
          req.session.user.userId,
        );
      } catch (error) {
        console.error(
          'Error fetching calculation history:',
          error instanceof Error ? error.message : error,
        );
      }
    }

    return {
      message: 'Calculation History',
      path: '/history',
      user: req.session.user || null,
      isLoggedIn,
      history,
    };
  }
}
