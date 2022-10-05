import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { json } from 'express';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { InternalServerErrorExceptionsFilter } from './common/filters/internal-server-error-exceptions.filter';
import { ApiTokenGuard } from './auth/guards/api-token.guard';
import { Reflector } from '@nestjs/core';

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
      .setGlobalPrefix('api/v1')
      .useGlobalGuards(new ApiTokenGuard(reflector))
      .useGlobalFilters(new InternalServerErrorExceptionsFilter())
      .useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          validationError: {
            target: false,
          },
          stopAtFirstError: true,
          forbidNonWhitelisted: true,
        }),
      );

    return app;
  }
}
