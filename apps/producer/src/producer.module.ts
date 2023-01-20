import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OutboxModule } from '@api/outbox/outbox.module';
import { EnvHelper } from '@app/env/env.helper';
import { KafkaProducerProvider } from './producer.provider';
import { ProducerService } from './producer.service';
import { ProducerTasks } from './producer.tasks';
import { ScheduleModule } from '@nestjs/schedule';
import { validateProducer } from '@app/env/env.validator';
import { DatabaseModule } from '@app/database';
import kafkaConfig from '../../../libs/common/src/configs/kafka.config';
import redisConfig from '../../../libs/common/src/configs/redis.config';
import producerConfig from './config/producer.config';

EnvHelper.verifyNodeEnv();

const imports = [
  ConfigModule.forRoot({
    envFilePath: EnvHelper.getEnvFilePath(),
    isGlobal: true,
    load: [producerConfig, kafkaConfig, redisConfig],
    validate: validateProducer,
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
