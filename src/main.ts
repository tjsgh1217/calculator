import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.use(
    session({
      secret: process.env.USERS_SESSION_KEY as string,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    }),
  );

  await app.listen(3000);
}
bootstrap();
