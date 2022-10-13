import { Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ConsumerController } from './consumer.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvHelper } from '@src/common/helpers/env.helper';
import { validate } from '@src/common/validators/env.validator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UserModule } from '@src/user/user.module';
import { TicketModule } from '@src/ticket/ticket.module';
import { TicketTransferModule } from '@src/ticket-transfer/ticket-transfer.module';
import databaseConfig from '@src/config/database.config';
import kafkaConfig from '@src/config/kafka.config';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [databaseConfig, kafkaConfig],
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
    UserModule,
    TicketModule,
    TicketTransferModule,
  ],
  providers: [ConsumerService],
  controllers: [ConsumerController],
})
export class ConsumerModule {}
