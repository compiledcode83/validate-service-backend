import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { json } from 'express';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { InternalServerErrorExceptionsFilter } from './common/filters/internal-server-error-exceptions.filter';
import { ApiKeyOrJwtGuard } from './auth/guards/api-key-or-jwt.guard';
import { ConsumerModule } from './consumer/consumer.module';
import { ProducerModule } from './producer/producer.module';

export class AppBootstrapManager {
  static getTestingModuleBuilder(): TestingModuleBuilder {
    return Test.createTestingModule({
      imports: [AppModule, ConsumerModule, ProducerModule],
    });
  }

  static setAppDefaults(app: INestApplication): INestApplication {
    const reflector = app.get(Reflector);

    useContainer(app.select(AppModule), { fallbackOnErrors: true, fallback: true });

    app
      .use(json({ limit: '50mb' }))
      .use(cookieParser())
      .setGlobalPrefix('api/v1')
      .useGlobalGuards(new ApiKeyOrJwtGuard(reflector))
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
      )
      .enableCors({
        origin: ['https://valicit.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      });

    return app;
  }
}
