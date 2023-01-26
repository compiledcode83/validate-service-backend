import { Module } from '@nestjs/common';
import { StripeProvider } from './stripe.provider';
import { StripeService } from './stripe.service';

@Module({
  providers: [StripeService, StripeProvider],
  exports: [StripeService],
})
export class StripeModule {}
