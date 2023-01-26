import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { json } from 'express';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { InternalServerErrorExceptionsFilter } from '@app/common/filters/internal-server-error-exceptions.filter';
import { QueryFailedErrorExceptionsFilter } from '@app/common/filters/query-failed-error-exception.filter';

export class AppBootstrapManager {
  static async getTestingModule(): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  }

  static setAppDefaults(app: INestApplication): INestApplication {
    const reflector = app.get(Reflector);

    useContainer(app.select(AppModule), { fallbackOnErrors: true, fallback: true });

    app
      .use(json({ limit: '50mb' }))
      .use(cookieParser())
      .setGlobalPrefix('api/v1')
      .useGlobalGuards(new JwtAuthGuard(reflector))
      .useGlobalFilters(new InternalServerErrorExceptionsFilter())
      .useGlobalFilters(new QueryFailedErrorExceptionsFilter())
      .useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          validationError: {
            target: false,
          },
          stopAtFirstError: true,
        }),
      );

    app.enableCors({
      origin: ['https://validate-admin.digikraft.io', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true,
    });

    return app;
  }
}
