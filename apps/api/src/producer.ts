import { NestFactory } from '@nestjs/core';
import { InternalServerErrorExceptionsFilter } from './common/filters/internal-server-error-exceptions.filter';
import { ProducerModule } from './producer/producer.module';
import * as dotenv from 'dotenv';
import { EnvHelper } from './common/helpers/env.helper';

EnvHelper.verifyNodeEnv();

dotenv.config({ path: EnvHelper.getEnvFilePath() });

async function bootstrap() {
  const app = await NestFactory.create(ProducerModule);

  app.useGlobalFilters(new InternalServerErrorExceptionsFilter());
  app.enableShutdownHooks();

  await app.listen(4000);
}
bootstrap();
