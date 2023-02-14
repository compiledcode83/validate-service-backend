import { BadRequestException, Inject, Injectable, RawBodyRequest } from '@nestjs/common';
import { Stripe } from 'stripe';
import { DateTime } from 'luxon';
import { Request } from 'express';
import {
  CancelPaywallResponse,
  CreatePaywallResponse,
  HandleWebhookResponse,
  PaymentProviderService,
} from '@web/payment/payment.types';
import { StripeCheckoutSessionStatus, STRIPE_PROVIDER_TOKEN } from './stripe.types';
import { ConfigService } from '@nestjs/config';
import { Order } from '@app/order/order.entity';
import { OrderPaymentStatus } from '@app/order/order.types';
import { OrderPrimary } from '@app/order/order-primary.entity';

@Injectable()
export class StripeService implements PaymentProviderService {
  constructor(
    @Inject(STRIPE_PROVIDER_TOKEN) public readonly stripe: Stripe,
    private readonly configService: ConfigService,
  ) {}

  async createPaywall(order: Order): Promise<CreatePaywallResponse> {
    try {
      const checkoutSession = await this.createCheckoutSession(order);

      return {
        id: checkoutSession.id,
        url: checkoutSession.url,
        status: checkoutSession.status as StripeCheckoutSessionStatus,
        raw: checkoutSession,
        success: checkoutSession.status === StripeCheckoutSessionStatus.Open,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async cancelPaywall(order: Order): Promise<CancelPaywallResponse> {
    try {
      if (!order.payment?.externalId) {
        throw new BadRequestException(`Can't cancel the paywall, external id not found`);
      }

      const checkoutSession = await this.expireCheckoutSession(order.payment.externalId);
      const success = checkoutSession.status === StripeCheckoutSessionStatus.Expired;

      return {
        id: checkoutSession.id,
        status: checkoutSession.status as StripeCheckoutSessionStatus,
        raw: checkoutSession,
        success,
      };
    } catch (err) {
      switch (err.type) {
        case 'StripeInvalidRequestError':
          /** Session was already expired */
          if (err.raw.message.includes(StripeCheckoutSessionStatus.Expired)) {
            return {
              id: order.payment.externalId,
              status: StripeCheckoutSessionStatus.Expired,
              raw: err.raw,
              success: true,
            };
          }

          /** Session was completed before we tried to expire it */
          if (err.raw.message.includes(StripeCheckoutSessionStatus.Complete)) {
            return {
              id: order.payment.externalId,
              status: StripeCheckoutSessionStatus.Complete,
              raw: err.raw,
              success: true,
            };
          }

          throw err;
        case 'StripeRateLimitError':
        case 'StripeAPIError':
        case 'StripeConnectionError':
        default:
          throw err;
      }
    }
  }

  async handleWebhook(request: RawBodyRequest<Request>): Promise<HandleWebhookResponse> {
    const payload = request.body;
    const sig = request.headers['stripe-signature'];
    let session: Stripe.Checkout.Session;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, this.configService.get('stripeConfig.webhookSecret'));
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid') {
          return {
            id: session.id,
            status: OrderPaymentStatus.Completed,
            raw: event,
          };
        }

        break;
      case 'checkout.session.expired':
        session = event.data.object as Stripe.Checkout.Session;

        return {
          id: session.id,
          status: OrderPaymentStatus.Declined,
          raw: event,
        };
    }

    return null;
  }

  private async createCheckoutSession(order: Order): Promise<Stripe.Checkout.Session> {
    const lineItems = order.primaryPurchases.map(
      (primaryPurchase: OrderPrimary): Stripe.Checkout.SessionCreateParams.LineItem => ({
        adjustable_quantity: {
          enabled: false,
        },
        quantity: primaryPurchase.quantity,
        price_data: {
          unit_amount: Number(primaryPurchase.ticketType.salePrice) * 100,
          currency: primaryPurchase.ticketType.saleCurrency,
          product_data: {
            name: primaryPurchase.ticketType.name,
          },
        },
      }),
    );

    const session = await this.stripe.checkout.sessions.create({
      client_reference_id: order.uuid,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      currency: order.saleCurrency,
      success_url: `https://${this.configService.get('appConfig.marketplaceDomain')}/payment/success`,
      cancel_url: `https://${this.configService.get('appConfig.marketplaceDomain')}/payment/cancel`,
      after_expiration: {
        recovery: {
          enabled: false,
        },
      },
      customer_email: order.buyer.email,
      expires_at: DateTime.now().plus({ minutes: 30 }).toUnixInteger(),
    });

    if (session?.status !== 'open') {
      throw new BadRequestException('Something went wront while creating Stripe Checkout Session');
    }

    return session;
  }

  private async getCheckoutSessionLineItems(checkoutSessionId: string): Promise<Stripe.ApiList<Stripe.LineItem>> {
    return this.stripe.checkout.sessions.listLineItems(checkoutSessionId);
  }

  private async expireCheckoutSession(checkoutSessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return this.stripe.checkout.sessions.expire(checkoutSessionId);
  }
}
