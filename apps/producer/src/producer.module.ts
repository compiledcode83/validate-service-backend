import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvHelper } from '@app/env/env.helper';
import { KafkaProducerProvider } from './producer.provider';
import { ProducerService } from './producer.service';
import { ProducerTasks } from './producer.tasks';
import { ScheduleModule } from '@nestjs/schedule';
import { validateProducer } from '@app/env/env.validator';
import { DatabaseModule } from '@app/database/database.module';
import { OutboxModule } from '@app/outbox/outbox.module';
import kafkaConfig from '../../../libs/common/src/configs/kafka.config';
import redisConfig from '../../../libs/common/src/configs/redis.config';
import appConfig from './config/app.config';
import stripeConfig from '@web/config/stripe.config';

EnvHelper.verifyNodeEnv();

const imports = [
  ConfigModule.forRoot({
    envFilePath: EnvHelper.getEnvFilePath(),
    isGlobal: true,
    load: [appConfig, kafkaConfig, redisConfig, stripeConfig],
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
