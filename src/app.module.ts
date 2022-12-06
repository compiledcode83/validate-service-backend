import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvHelper } from './common/helpers/env.helper';
import { validate } from './common/validators/env.validator';
import { TicketProviderModule } from './ticket-provider/ticket-provider.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TicketProviderApiTokenModule } from './ticket-provider-api-token/ticket-provider-api-token.module';
import { TicketModule } from './ticket/ticket.module';
import { TicketTransferModule } from './ticket-transfer/ticket-transfer.module';
import { TicketProviderEncryptionKeyModule } from './ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketProviderRefreshTokenModule } from './ticket-provider-refresh-token/ticket-provider-refresh-token.module';
import { EventModule } from './event/event.module';
import { RedisModule } from './redis/redis.module';
import { OutboxModule } from './outbox/outbox.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import kafkaConfig from './config/kafka.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [appConfig, databaseConfig, kafkaConfig, jwtConfig, redisConfig],
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
    OutboxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
