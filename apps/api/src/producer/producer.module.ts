import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OutboxModule } from '@api/outbox/outbox.module';
import { EnvHelper } from '@app/env/env.helper';
import { KafkaProducerProvider } from './producer.provider';
import { ProducerService } from './producer.service';
import { ProducerTasks } from './producer.tasks';
import { ScheduleModule } from '@nestjs/schedule';
import { validateApi } from '@app/env/env.validator';
import kafkaConfig from '@api/config/kafka.config';
import appConfig from '@api/config/app.config';
import redisConfig from '@api/config/redis.config';
import { DatabaseModule } from '@app/database';

EnvHelper.verifyNodeEnv();

const imports = [
  ConfigModule.forRoot({
    envFilePath: EnvHelper.getEnvFilePath(),
    isGlobal: true,
    load: [appConfig, kafkaConfig, redisConfig],
    validate: validateApi,
  }),
  DatabaseModule,
  OutboxModule,
];

if (!EnvHelper.isTest()) {
  imports.push(ScheduleModule.forRoot());
}

@Module({
  imports,
  providers: [ProducerService, KafkaProducerProvider, ProducerTasks],
  exports: [ProducerService],
})
export class ProducerModule {}
