import * as dotenv from 'dotenv';
import { EnvHelper } from '@app/env';
import { NestFactory } from '@nestjs/core';
import { ProducerModule } from './producer.module';
import { InternalServerErrorExceptionsFilter } from '@app/common';

EnvHelper.verifyNodeEnv();

dotenv.config({ path: EnvHelper.getEnvFilePath() });

async function bootstrap() {
  const app = await NestFactory.create(ProducerModule);

  app.useGlobalFilters(new InternalServerErrorExceptionsFilter());
  app.enableShutdownHooks();

  await app.listen(4000);
}
bootstrap();
