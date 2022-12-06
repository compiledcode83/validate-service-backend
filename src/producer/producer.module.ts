import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { OutboxModule } from '@src/outbox/outbox.module';
import { EnvHelper } from '@src/common/helpers/env.helper';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { KafkaProducerProvider } from './producer.provider';
import { ProducerService } from './producer.service';
import { ProducerTasks } from './producer.tasks';
import { ScheduleModule } from '@nestjs/schedule';
import kafkaConfig from '@src/config/kafka.config';
import databaseConfig from '@src/config/database.config';
import appConfig from '@src/config/app.config';
import redisConfig from '@src/config/redis.config';

EnvHelper.verifyNodeEnv();

const imports = [
  ConfigModule.forRoot({
    envFilePath: EnvHelper.getEnvFilePath(),
    isGlobal: true,
    load: [appConfig, databaseConfig, kafkaConfig, redisConfig],
    validate: validate,
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
      const config = configService.get('databaseConfig');

      return {
        ...config,
        namingStrategy: new SnakeNamingStrategy(),
        autoLoadEntities: true,
      };
    },
    inject: [ConfigService],
  }),
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
