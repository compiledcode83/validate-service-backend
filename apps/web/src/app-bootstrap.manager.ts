import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { raw } from 'express';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ConsumerModule } from '@consumer/consumer.module';
import { ProducerModule } from '@producer/producer.module';
import { InternalServerErrorExceptionsFilter } from '@app/common/filters/internal-server-error-exceptions.filter';
import { QueryFailedErrorExceptionsFilter } from '@app/common/filters/query-failed-error-exception.filter';

export class AppBootstrapManager {
  static getTestingModuleBuilder(): TestingModuleBuilder {
    return Test.createTestingModule({
      imports: [ConsumerModule, ProducerModule, AppModule],
    });
  }

  static setAppDefaults(app: NestExpressApplication): INestApplication {
    const reflector = app.get(Reflector);

    useContainer(app.select(AppModule), { fallbackOnErrors: true, fallback: true });

    app
      .use('/api/v1/payments/webhook/stripe', raw({ type: '*/*' }))
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
          forbidNonWhitelisted: true,
        }),
      )
      .enableCors({
        origin: ['https://tickets.valicit.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      });

    app.set('trust proxy', 1);

    return app;
  }
}
