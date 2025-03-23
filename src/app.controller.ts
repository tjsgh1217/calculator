import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

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

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  }
}
