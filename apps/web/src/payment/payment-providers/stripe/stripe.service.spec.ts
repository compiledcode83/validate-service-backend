import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { StripeService } from './stripe.service';
import { AppModule } from '@web/app.module';
import { OrderService } from '@web/order/order.service';
import { ConfigService } from '@nestjs/config';
import { TestHelper } from '@app/common/helpers/test.helper';
import { EnvHelper } from '@app/env/env.helper';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { OrderFactory } from '@app/database/factories/order.factory';
import { OrderPaymentFactory } from '@app/database/factories/order-payment.factory';
import { OrderPaymentStatus } from '@app/order/order.types';

EnvHelper.verifyNodeEnv();

dotenv.config({ path: EnvHelper.getEnvFilePath() });

describe('StripeService', () => {
  let stripeService: StripeService;
  let orderService: OrderService;
  let testHelper: TestHelper;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    stripeService = module.get<StripeService>(StripeService);
    orderService = module.get<OrderService>(OrderService);
    configService = module.get<ConfigService>(ConfigService);

    testHelper = new TestHelper(module, jest);

    await AppDataSource.initialize();
  });

  afterAll(async () => {
    jest.resetAllMocks().restoreAllMocks();
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should check checkout data to be correct', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType1 = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '125.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event.id,
    });
    const ticketType2 = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '55.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event.id,
    });
    const buyingQuantity = 2;
    const ticket1PriceInCents = Number(ticketType1.salePrice) * 100;
    const ticket2PriceInCents = Number(ticketType2.salePrice) * 100;

    const order = await OrderFactory.create({ buyerId: user.id }, [
      { ticketTypeId: ticketType1.id, quantity: buyingQuantity },
      { ticketTypeId: ticketType2.id, quantity: buyingQuantity },
    ]);
    const fullOrder = await orderService.findByUuid(order.uuid);
    const session = await stripeService['createCheckoutSession'](fullOrder);

    expect(session).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        object: 'checkout.session',
        after_expiration: expect.objectContaining({
          recovery: expect.objectContaining({
            enabled: false,
          }),
        }),
        amount_subtotal: ticket1PriceInCents * buyingQuantity + ticket2PriceInCents * buyingQuantity,
        amount_total: ticket1PriceInCents * buyingQuantity + ticket2PriceInCents * buyingQuantity,
        client_reference_id: fullOrder.uuid,
        currency: fullOrder.saleCurrency.toLowerCase(),
        customer_email: fullOrder.buyer.email,
        expires_at: expect.any(Number),
        mode: 'payment',
        status: 'open',
        url: expect.any(String),
      }),
    );

    const lineItems = await stripeService['getCheckoutSessionLineItems'](session.id);

    expect(lineItems.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          amount_total: ticket1PriceInCents * buyingQuantity,
          currency: ticketType1.saleCurrency.toLowerCase(),
          quantity: buyingQuantity,
          description: ticketType1.name,
          price: expect.objectContaining({
            unit_amount: ticket1PriceInCents,
          }),
        }),
        expect.objectContaining({
          amount_total: ticket2PriceInCents * buyingQuantity,
          currency: ticketType2.saleCurrency.toLowerCase(),
          quantity: buyingQuantity,
          description: ticketType2.name,
          price: expect.objectContaining({
            unit_amount: ticket2PriceInCents,
          }),
        }),
      ]),
    );
  });

  it('should create a checkout session', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '100.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event.id,
    });

    const order = await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
    const fullOrder = await orderService.findByUuid(order.uuid);
    const session = await stripeService.createPaywall(fullOrder);

    expect(session).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        url: expect.any(String),
      }),
    );
  });

  it('should cancel a checkout session', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '100.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event.id,
    });

    const order = await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
    const fullOrder = await orderService.findByUuid(order.uuid);
    const session = await stripeService.createPaywall(fullOrder);

    expect(session).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        url: expect.any(String),
      }),
    );
  });

  it('should handle a checkout.session.completed webhook event', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '100.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event.id,
    });
    const order = await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
    const externalId = 'cs_test_a12x7LB1DXvvKGfsHM3bmOOUkMpw520HUZABES28WgCDHZjof0E83SC7vl';

    await OrderPaymentFactory.create({ orderId: order.id, externalId });

    const rawBody = `{
      "id": "evt_1MJFtgHjGGJdCouTSovm9hsA",
      "object": "event",
      "api_version": "2022-11-15",
      "created": 1672058116,
      "data": {
        "object": {
          "id": "${externalId}",
          "object": "checkout.session",
          "after_expiration": {
            "recovery": {
              "allow_promotion_codes": false,
              "enabled": false,
              "expires_at": null,
              "url": null
            }
          },
          "allow_promotion_codes": null,
          "amount_subtotal": 1000,
          "amount_total": 1000,
          "automatic_tax": {
            "enabled": false,
            "status": null
          },
          "billing_address_collection": null,
          "cancel_url": "https://example.com/cancel",
          "client_reference_id": "8ce0f437-bbf0-44f1-892b-50912846e37d",
          "consent": null,
          "consent_collection": null,
          "created": 1672058107,
          "currency": "eur",
          "custom_text": {
            "shipping_address": null,
            "submit": null
          },
          "customer": null,
          "customer_creation": "if_required",
          "customer_details": {
            "address": {
              "city": null,
              "country": "UA",
              "line1": null,
              "line2": null,
              "postal_code": null,
              "state": null
            },
            "email": "${user.email}",
            "name": "John Doe",
            "phone": null,
            "tax_exempt": "none",
            "tax_ids": [
            ]
          },
          "customer_email": "${user.email}",
          "expires_at": 1672059906,
          "invoice": null,
          "invoice_creation": {
            "enabled": false,
            "invoice_data": {
              "account_tax_ids": null,
              "custom_fields": null,
              "description": null,
              "footer": null,
              "metadata": {
              },
              "rendering_options": null
            }
          },
          "livemode": false,
          "locale": null,
          "metadata": {
          },
          "mode": "payment",
          "payment_intent": "pi_3MJFteHjGGJdCouT1ppiH5OZ",
          "payment_link": null,
          "payment_method_collection": "always",
          "payment_method_options": {
          },
          "payment_method_types": [
            "card"
          ],
          "payment_status": "paid",
          "phone_number_collection": {
            "enabled": false
          },
          "recovered_from": null,
          "setup_intent": null,
          "shipping_address_collection": null,
          "shipping_cost": null,
          "shipping_details": null,
          "shipping_options": [
          ],
          "status": "complete",
          "submit_type": null,
          "subscription": null,
          "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
          "total_details": {
            "amount_discount": 0,
            "amount_shipping": 0,
            "amount_tax": 0
          },
          "url": null
        }
      },
      "livemode": false,
      "pending_webhooks": 2,
      "request": {
        "id": null,
        "idempotency_key": null
      },
      "type": "checkout.session.completed"
    }`;

    const webhookPayload = stripeService.stripe.webhooks.generateTestHeaderString({
      payload: rawBody,
      secret: configService.get('stripeConfig.webhookSecret'),
    });

    const request = {
      headers: {
        'stripe-signature': webhookPayload,
      },
      body: Buffer.from(rawBody, 'utf-8'),
    };

    const handledWebhook = await stripeService.handleWebhook(request as any);

    expect(handledWebhook).toEqual(
      expect.objectContaining({
        id: externalId,
        status: OrderPaymentStatus.Completed,
        raw: JSON.parse(rawBody),
      }),
    );
  });

  it('should handle a checkout.session.expired webhook event', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '100.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event.id,
    });
    const order = await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
    const externalId = 'cs_test_a12x7LB1DXvvKGfsHM3bmOOUkMpw520HUZABES28WgCDHZjof0E83SC7vl';

    await OrderPaymentFactory.create({ orderId: order.id, externalId });

    const rawBody = `{
      "id": "evt_1MJFtgHjGGJdCouTSovm9hsA",
      "object": "event",
      "api_version": "2022-11-15",
      "created": 1672058116,
      "data": {
        "object": {
          "id": "${externalId}",
          "object": "checkout.session",
          "after_expiration": {
            "recovery": {
              "allow_promotion_codes": false,
              "enabled": false,
              "expires_at": null,
              "url": null
            }
          },
          "allow_promotion_codes": null,
          "amount_subtotal": 1000,
          "amount_total": 1000,
          "automatic_tax": {
            "enabled": false,
            "status": null
          },
          "billing_address_collection": null,
          "cancel_url": "https://example.com/cancel",
          "client_reference_id": "8ce0f437-bbf0-44f1-892b-50912846e37d",
          "consent": null,
          "consent_collection": null,
          "created": 1672058107,
          "currency": "eur",
          "custom_text": {
            "shipping_address": null,
            "submit": null
          },
          "customer": null,
          "customer_creation": "if_required",
          "customer_details": {
            "address": {
              "city": null,
              "country": "UA",
              "line1": null,
              "line2": null,
              "postal_code": null,
              "state": null
            },
            "email": "${user.email}",
            "name": "John Doe",
            "phone": null,
            "tax_exempt": "none",
            "tax_ids": [
            ]
          },
          "customer_email": "${user.email}",
          "expires_at": 1672059906,
          "invoice": null,
          "invoice_creation": {
            "enabled": false,
            "invoice_data": {
              "account_tax_ids": null,
              "custom_fields": null,
              "description": null,
              "footer": null,
              "metadata": {
              },
              "rendering_options": null
            }
          },
          "livemode": false,
          "locale": null,
          "metadata": {
          },
          "mode": "payment",
          "payment_intent": "pi_3MJFteHjGGJdCouT1ppiH5OZ",
          "payment_link": null,
          "payment_method_collection": "always",
          "payment_method_options": {
          },
          "payment_method_types": [
            "card"
          ],
          "payment_status": "unpaid",
          "phone_number_collection": {
            "enabled": false
          },
          "recovered_from": null,
          "setup_intent": null,
          "shipping_address_collection": null,
          "shipping_cost": null,
          "shipping_details": null,
          "shipping_options": [
          ],
          "status": "expired",
          "submit_type": null,
          "subscription": null,
          "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
          "total_details": {
            "amount_discount": 0,
            "amount_shipping": 0,
            "amount_tax": 0
          },
          "url": null
        }
      },
      "livemode": false,
      "pending_webhooks": 2,
      "request": {
        "id": null,
        "idempotency_key": null
      },
      "type": "checkout.session.expired"
    }`;

    const webhookPayload = stripeService.stripe.webhooks.generateTestHeaderString({
      payload: rawBody,
      secret: configService.get('stripeConfig.webhookSecret'),
    });

    const request = {
      headers: {
        'stripe-signature': webhookPayload,
      },
      body: Buffer.from(rawBody, 'utf-8'),
    };

    const handledWebhook = await stripeService.handleWebhook(request as any);

    expect(handledWebhook).toEqual(
      expect.objectContaining({
        id: externalId,
        status: OrderPaymentStatus.Declined,
        raw: JSON.parse(rawBody),
      }),
    );
  });
});
