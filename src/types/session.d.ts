import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: { name: string; email: string }; // User 타입 정의
    isLoggedIn?: boolean;
  }
}
