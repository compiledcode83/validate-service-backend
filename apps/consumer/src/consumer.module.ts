import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { ConfigModule } from '@nestjs/config';
import { EnvHelper } from '@app/env/env.helper';
import { validateConsumer } from '@app/env/env.validator';
import { TicketTransferModule } from '@api/ticket-transfer/ticket-transfer.module';
import { DatabaseModule } from '@app/database/database.module';
import { MessageModule } from '@web/message/message.module';
import { InboxModule } from '@app/inbox/inbox.module';
import { PaymentModule } from '@web/payment/payment.module';
import { OrderModule } from '@web/order/order.module';
import { TicketModule as CommonTicketModule } from '@app/ticket/ticket.module';
import { UserModule as CommonUserModule } from '@app/user/user.module';
import kafkaConfig from '../../../libs/common/src/configs/kafka.config';
import redisConfig from '../../../libs/common/src/configs/redis.config';
import appConfig from './config/app.config';
import stripeConfig from '@web/config/stripe.config';
import orderConfig from '@web/config/order.config';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [appConfig, kafkaConfig, redisConfig, stripeConfig, orderConfig],
      validate: validateConsumer,
    }),
    DatabaseModule,
    CommonUserModule,
    CommonTicketModule,
    TicketTransferModule,
    MessageModule,
    InboxModule,
    PaymentModule,
    OrderModule,
  ],
  providers: [ConsumerService],
  controllers: [ConsumerController],
  exports: [ConsumerService],
})
export class ConsumerModule {}
