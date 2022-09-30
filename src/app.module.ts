import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvHelper } from './common/helpers/env.helper';
import { validate } from './common/validators/env.validator';
import { TicketProviderModule } from './ticket-provider/ticket-provider.module';
import databaseConfig from './config/database.config';
import { DataSource } from 'typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TicketProviderApiTokenModule } from './ticket-provider-api-token/ticket-provider-api-token.module';
import { TicketModule } from './ticket/ticket.module';
import { TicketTransferModule } from './ticket-transfer/ticket-transfer.module';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [databaseConfig],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
