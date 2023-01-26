import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { StripeModule } from './payment-providers/stripe/stripe.module';
import { PaymentProviderFactory } from './payment-provider.factory';
import { OrderModule } from '@web/order/order.module';
import { OrderIsPayableValidator } from './validators/order-is-payable.validator';

@Module({
  imports: [StripeModule, OrderModule],
  providers: [PaymentService, PaymentProviderFactory, OrderIsPayableValidator],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
