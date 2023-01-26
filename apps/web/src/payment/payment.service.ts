import { OrderPaymentStatus } from '@app/order/order.types';
import { Injectable, InternalServerErrorException, Logger, RawBodyRequest } from '@nestjs/common';
import { OrderService } from '@web/order/order.service';
import { Request } from 'express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentProviderFactory } from './payment-provider.factory';
import { CreatePaymentResponse, PaymentProviderType } from './payment.types';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentProviderFactory: PaymentProviderFactory,
    private readonly orderService: OrderService,
  ) {}

  async create(body: CreatePaymentDto): Promise<CreatePaymentResponse> {
    const order = await this.orderService.findByUuid(body.orderUuid);
    const paymentProvider = this.paymentProviderFactory.getProvider(body.paymentProviderType);
    const paywall = await paymentProvider.createPaywall(order);

    if (!paywall.success) {
      throw new InternalServerErrorException(`Error creating a paywall`);
    }

    await this.orderService.createOrderPayment(order.id, paywall.id, JSON.stringify(paywall.raw));

    return {
      url: paywall.url,
    };
  }

  async cancel(orderUuid: string, paymentProviderType: PaymentProviderType): Promise<void> {
    const order = await this.orderService.findByUuid(orderUuid);
    const paymentProvider = this.paymentProviderFactory.getProvider(paymentProviderType);
    const cancelPaywallResponse = await paymentProvider.cancelPaywall(order);

    if (!cancelPaywallResponse.success) {
      throw new InternalServerErrorException(`Error canceling a paywall`);
    }

    await this.orderService.cancelOrder(order.id);
  }

  async handleWebhook(request: RawBodyRequest<Request>, paymentProviderType: PaymentProviderType) {
    const paymentProvider = this.paymentProviderFactory.getProvider(paymentProviderType);
    const handledWebhook = await paymentProvider.handleWebhook(request);

    if (!handledWebhook) {
      return this.logger.warn(`Unhandled webhook`);
    }

    const order = await this.orderService.findCompletableByExternalId(handledWebhook.id);

    if (!order) {
      return this.logger.warn(`Order is not completable or has been already processed ${order?.uuid ?? ''}`);
    }

    if (handledWebhook.status === OrderPaymentStatus.Declined) {
      return this.orderService.cancelOrder(order.id);
    }

    await this.orderService.handleOrderPayment(order);

    return this.logger.log(`Handled webhook for order ${order.uuid}`);
  }
}
