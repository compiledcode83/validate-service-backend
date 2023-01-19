import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { ConfigModule } from '@nestjs/config';
import { EnvHelper } from '@app/env/env.helper';
import { validateApi } from '@app/env/env.validator';
import { UserModule } from '@api/user/user.module';
import { TicketModule } from '@api/ticket/ticket.module';
import { TicketTransferModule } from '@api/ticket-transfer/ticket-transfer.module';
import kafkaConfig from '@api/config/kafka.config';
import { DatabaseModule } from '@app/database';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [kafkaConfig],
      validate: validateApi,
    }),
    DatabaseModule,
    UserModule,
    TicketModule,
    TicketTransferModule,
  ],
  providers: [ConsumerService],
  controllers: [ConsumerController],
})
export class ConsumerModule {}
