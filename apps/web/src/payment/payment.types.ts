import { Order } from '@app/order/order.entity';
import { OrderPaymentStatus } from '@app/order/order.types';
import { RawBodyRequest } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Request } from 'express';
import { StripeCheckoutSessionStatus } from './payment-providers/stripe/stripe.types';

export interface CreatePaywallResponse {
  id: string;
  url: string;
  status: StripeCheckoutSessionStatus;
  raw: any;
  success: boolean;
}

export interface CancelPaywallResponse {
  id: string;
  status: StripeCheckoutSessionStatus;
  raw: any;
  success: boolean;
}

export interface HandleWebhookResponse {
  id: string;
  status: OrderPaymentStatus;
  raw: any;
}

export interface PaymentProviderService {
  createPaywall(order: Order): Promise<CreatePaywallResponse>;
  cancelPaywall(order: Order): Promise<CancelPaywallResponse>;
  handleWebhook(request: RawBodyRequest<Request>): Promise<HandleWebhookResponse>;
}

export enum PaymentProviderType {
  Stripe = 'stripe',
}

export class CreatePaymentResponse {
  @ApiProperty({ example: 'https://example.com', description: 'Paywall URL' })
  url: string;
}

export enum PaymentEventPattern {
  CancelPaywall = 'payment.paywall.cancel',
}
