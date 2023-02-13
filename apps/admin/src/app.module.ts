import { Module } from '@nestjs/common';
import path = require('path');
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { AdminRefreshTokenModule } from './admin-refresh-token/admin-refresh-token.module';
import { EnvHelper } from '@app/env/env.helper';
import { DatabaseModule } from '@app/database/database.module';
import { TicketProviderModule } from './ticket-provider/ticket-provider.module';
import { UserModule } from './user/user.module';
import { TicketModule } from './ticket/ticket.module';
import { EventModule } from './event/event.module';
import { SentryModule } from '@app/sentry/sentry.module';
import { TicketTypeModule } from './ticket-type/ticket-type.module';
import { OrderModule } from './order/order.module';
import { validateAdmin } from '@app/env/env.validator';
import { TicketProviderApiTokenModule } from './ticket-provider-api-token/ticket-provider-api-token.module';
import { TicketProviderEncryptionKeyModule } from './ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketTransferModule } from './ticket-transfer/ticket-transfer.module';
import { TranslationModule } from '@app/translation/translation.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { Locale } from '@app/translation/translation.types';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [appConfig, jwtConfig],
      validate: validateAdmin,
    }),
    I18nModule.forRoot({
      fallbackLanguage: Locale.en_US,
      loaderOptions: {
        path: EnvHelper.isTest() ? path.join(__dirname, '../i18n') : path.join(__dirname, '../../../i18n'),
        watch: true,
      },
      fallbacks: {
        'en-*': Locale.en_US,
        pt: Locale.pt_BR,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    DatabaseModule,
    TicketProviderModule,
    UserModule,
    TicketModule,
    AuthModule,
    AdminModule,
    AdminRefreshTokenModule,
    EventModule,
    SentryModule,
    TicketTypeModule,
    OrderModule,
    TicketProviderApiTokenModule,
    TicketProviderEncryptionKeyModule,
    TicketTransferModule,
    TranslationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
