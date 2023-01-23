import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { ConfigModule } from '@nestjs/config';
import { EnvHelper } from '@app/env/env.helper';
import { validateConsumer } from '@app/env/env.validator';
import { UserModule } from '@api/user/user.module';
import { TicketModule } from '@api/ticket/ticket.module';
import { TicketTransferModule } from '@api/ticket-transfer/ticket-transfer.module';
import { DatabaseModule } from '@app/database/database.module';
import kafkaConfig from '../../../libs/common/src/configs/kafka.config';
import redisConfig from '../../../libs/common/src/configs/redis.config';
import appConfig from './config/app.config';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [appConfig, kafkaConfig, redisConfig],
      validate: validateConsumer,
    }),
    DatabaseModule,
    UserModule,
    TicketModule,
    TicketTransferModule,
  ],
  providers: [ConsumerService],
  controllers: [ConsumerController],
  exports: [ConsumerService],
})
export class ConsumerModule {}
