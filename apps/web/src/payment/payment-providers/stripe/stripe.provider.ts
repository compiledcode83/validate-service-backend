import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { STRIPE_PROVIDER_TOKEN } from './stripe.types';

export const StripeProvider = {
  provide: STRIPE_PROVIDER_TOKEN,
  useFactory: async (configService: ConfigService): Promise<Stripe> =>
    new Stripe(configService.get('stripeConfig.apiKey'), { apiVersion: '2022-11-15' }),
  inject: [ConfigService],
};
