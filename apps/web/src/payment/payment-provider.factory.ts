import { Injectable } from '@nestjs/common';
import { StripeService } from './payment-providers/stripe/stripe.service';
import { PaymentProviderType, PaymentProviderService } from './payment.types';

@Injectable()
export class PaymentProviderFactory {
  constructor(private readonly stripeService: StripeService) {}

  getProvider(paymentProvider: PaymentProviderType): PaymentProviderService {
    switch (paymentProvider) {
      case PaymentProviderType.Stripe:
      default:
        return this.stripeService;
    }
  }
}
