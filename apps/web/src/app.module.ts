import { Module } from '@nestjs/common';
import path = require('path');
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedeemModule } from './redeem/redeem.module';
import { MessageModule } from './message/message.module';
import { SecurityModule } from './security/security.module';
import { ListingModule } from './listing/listing.module';
import { UserRefreshTokenModule } from './user-refresh-token/user-refresh-token.module';
import { AuthModule } from './auth/auth.module';
import { TicketTypeModule } from './ticket-type/ticket-type.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { StripeModule } from './payment/payment-providers/stripe/stripe.module';
import { EnvHelper } from '@app/env/env.helper';
import { validateWeb } from '@app/env/env.validator';
import { DatabaseModule } from '@app/database/database.module';
import { TicketProviderModule } from './ticket-provider/ticket-provider.module';
import { TicketModule } from './ticket/ticket.module';
import { UserModule } from './user/user.module';
import { RedisModule } from '@app/redis/redis.module';
import { SentryModule } from '@app/sentry/sentry.module';
import { EventModule } from './event/event.module';
import { TranslationModule } from '@app/translation/translation.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { Locale } from '@app/translation/translation.types';
import appConfig from './config/app.config';
import redeemConfig from './config/redeem.config';
import jwtConfig from './config/jwt.config';
import authConfig from './config/auth.config';
import orderConfig from './config/order.config';
import stripeConfig from './config/stripe.config';
import redisConfig from '../../../libs/common/src/configs/redis.config';
import kafkaConfig from '../../../libs/common/src/configs/kafka.config';

console.log(path.join(__dirname, '../../../../../i18n/'));

EnvHelper.verifyNodeEnv();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: EnvHelper.getEnvFilePath(),
      isGlobal: true,
      load: [appConfig, kafkaConfig, redeemConfig, redisConfig, jwtConfig, authConfig, orderConfig, stripeConfig],
      validate: validateWeb,
    }),
    I18nModule.forRoot({
      fallbackLanguage: Locale.en_US,
      loaderOptions: {
        path: path.join(__dirname, '../../../i18n'),
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
    TicketModule,
    UserModule,
    RedeemModule,
    MessageModule,
    SecurityModule,
    RedisModule,
    SentryModule,
    ListingModule,
    UserRefreshTokenModule,
    AuthModule,
    EventModule,
    TicketTypeModule,
    OrderModule,
    PaymentModule,
    StripeModule,
    TranslationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
