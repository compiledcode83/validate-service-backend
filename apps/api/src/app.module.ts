import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvHelper } from '../../../libs/env/src/env.helper';
import { validateApi } from '../../../libs/env/src/env.validator';
import { TicketProviderModule } from './ticket-provider/ticket-provider.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TicketProviderApiTokenModule } from './ticket-provider-api-token/ticket-provider-api-token.module';
import { TicketModule } from './ticket/ticket.module';
import { TicketTransferModule } from './ticket-transfer/ticket-transfer.module';
import { TicketProviderEncryptionKeyModule } from './ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketProviderRefreshTokenModule } from './ticket-provider-refresh-token/ticket-provider-refresh-token.module';
import { EventModule } from './event/event.module';
import { TicketTypeModule } from './ticket-type/ticket-type.module';
import { DatabaseModule } from '@app/database/database.module';
import { RedisModule } from '@app/redis/redis.module';
import { SentryModule } from '@app/sentry/sentry.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import redisConfig from '../../../libs/common/src/configs/redis.config';
import kafkaConfig from '../../../libs/common/src/configs/kafka.config';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [appConfig, kafkaConfig, jwtConfig, redisConfig],
      validate: validateApi,
    }),
    DatabaseModule,
    TicketProviderModule,
    UserModule,
    AuthModule,
    TicketProviderApiTokenModule,
    TicketModule,
    TicketTransferModule,
    TicketProviderEncryptionKeyModule,
    TicketProviderRefreshTokenModule,
    EventModule,
    RedisModule,
    SentryModule,
    TicketTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
