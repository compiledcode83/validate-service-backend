import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
import { AppBootstrapManager } from '@web/app-bootstrap.manager';
import { UserFactory } from '@app/database/factories/user.factory';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { EventFactory } from '@app/database/factories/event.factory';
import { OrderFactory } from '@app/database/factories/order.factory';
import { OrderPaymentStatus, OrderStatus } from '@app/order/order.types';
import { PaymentEventPattern, PaymentProviderType } from '@web/payment/payment.types';
import { OrderPaymentFactory } from '@app/database/factories/order-payment.factory';
import { OrderService } from '@web/order/order.service';
import { StripeService } from '@web/payment/payment-providers/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { Ticket } from '@app/ticket/ticket.entity';
import { MoreThan } from 'typeorm';
import { TicketEventPattern } from '@app/ticket/ticket.types';
import { PaymentCancelPaywallMessage } from '@web/payment/messages/payment-cancel-paywall.message';
import { Message } from '@app/message/message.entity';
import { MessageChannel, MessageEventPattern, MessageStatus, MessageType } from '@app/message/message.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { Outbox } from '@app/outbox/outbox.entity';
import { OutboxStatus } from '@app/outbox/outbox.types';
import { TicketCreateMessage } from '@app/ticket/messages/ticket-create.message';
import { MessageSendMessage } from '@app/message/messages/message-send.message';
import { Locale } from '@app/translation/translation.types';
import { TicketService } from '@web/ticket/ticket.service';

describe('Payments (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let orderService: OrderService;
  let stripeService: StripeService;
  let configService: ConfigService;
  let ticketService: TicketService;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
    moduleFixture = await testingModuleBuilder.compile();
    orderService = moduleFixture.get<OrderService>(OrderService);
    stripeService = moduleFixture.get<StripeService>(StripeService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    ticketService = moduleFixture.get<TicketService>(TicketService);

    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app as NestExpressApplication);
    testHelper = new TestHelper(moduleFixture, jest);

    await AppDataSource.initialize();
    await app.init();
  });

  afterAll(async () => {
    jest.resetAllMocks().restoreAllMocks();
    await AppDataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Creating payments', () => {
    it(`should respond with validation error when creating a new payment`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);

      await request(app.getHttpServer())
        .post(`/api/v1/payments`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          orderUuid: 'invalid',
        })
        .then((response) => {
          expect(response.body.message).toEqual([
            'orderUuid must be a UUID',
            'Order not found or is not payable',
            'paymentProviderType must be a valid enum value',
          ]);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a payment for an order in a non-created status`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '125.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const order = await OrderFactory.create({ buyerId: user.id, status: OrderStatus.Canceled }, [
        { ticketTypeId: ticketType.id, quantity: 1 },
      ]);

      await request(app.getHttpServer())
        .post(`/api/v1/payments`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          orderUuid: order.uuid,
          paymentProviderType: PaymentProviderType.Stripe,
        })
        .then((response) => {
          expect(response.body.message).toEqual(['Order not found or is not payable']);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a payment for an order with expired reservation`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '125.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const order = await OrderFactory.create(
        {
          buyerId: user.id,
          status: OrderStatus.Created,
          reservedUntil: DateTime.now().minus({ minutes: 1 }).toJSDate(),
        },
        [{ ticketTypeId: ticketType.id, quantity: 1 }],
      );

      await request(app.getHttpServer())
        .post(`/api/v1/payments`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          orderUuid: order.uuid,
          paymentProviderType: PaymentProviderType.Stripe,
        })
        .then((response) => {
          expect(response.body.message).toEqual(['Order not found or is not payable']);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a payment for an order that already has a payment initiated`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '125.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const order = await OrderFactory.create(
        {
          buyerId: user.id,
          status: OrderStatus.Created,
          reservedUntil: DateTime.now().plus({ minutes: 3 }).toJSDate(),
        },
        [{ ticketTypeId: ticketType.id, quantity: 1 }],
      );
      await OrderPaymentFactory.create({ orderId: order.id, externalId: faker.random.word() });

      await request(app.getHttpServer())
        .post(`/api/v1/payments`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          orderUuid: order.uuid,
          paymentProviderType: PaymentProviderType.Stripe,
        })
        .then((response) => {
          expect(response.body.message).toEqual(['Order not found or is not payable']);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a payment for an order that belongs to another user`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '125.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const order = await OrderFactory.create(
        {
          buyerId: user2.id,
          status: OrderStatus.Created,
          reservedUntil: DateTime.now().plus({ minutes: 3 }).toJSDate(),
        },
        [{ ticketTypeId: ticketType.id, quantity: 1 }],
      );

      await request(app.getHttpServer())
        .post(`/api/v1/payments`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          orderUuid: order.uuid,
          paymentProviderType: PaymentProviderType.Stripe,
        })
        .then((response) => {
          expect(response.body.message).toEqual(['Order not found or is not payable']);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`creates a new payment request successfully`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '125.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const order = await OrderFactory.create(
        {
          buyerId: user.id,
          status: OrderStatus.Created,
          reservedUntil: DateTime.now().plus({ minutes: 3 }).toJSDate(),
        },
        [{ ticketTypeId: ticketType.id, quantity: 1 }],
      );

      await request(app.getHttpServer())
        .post(`/api/v1/payments`)
        .auth(token, { type: 'bearer' })
        .set('Accept', 'application/json')
        .send({
          orderUuid: order.uuid,
          paymentProviderType: PaymentProviderType.Stripe,
        })
        .then(async (response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              url: expect.any(String),
            }),
          );
          expect(response.status).toBe(HttpStatus.CREATED);
          expect(response.body.url.startsWith('https://checkout.stripe.com')).toBeTruthy();

          const updatedOrder = await orderService.findByUuid(order.uuid, Locale.en_US);

          expect(updatedOrder).toEqual(
            expect.objectContaining({
              uuid: order.uuid,
              status: OrderStatus.Created,
              payment: expect.objectContaining({
                externalId: expect.any(String),
                externalStatus: OrderPaymentStatus.Pending,
              }),
            }),
          );

          const outbox = await AppDataSource.manager
            .getRepository(Outbox)
            .findOneBy({ eventName: PaymentEventPattern.CancelPaywall });

          expect(outbox).toEqual(
            expect.objectContaining({
              status: OutboxStatus.Created,
            }),
          );

          const expectedPayload = new PaymentCancelPaywallMessage({ order: updatedOrder }).toString();
          const sendAfterOutbox = DateTime.fromJSDate(outbox.sendAfter).toUTC().toISO();
          const reservedUntilDate = DateTime.fromJSDate(order.reservedUntil).toUTC().toISO();

          expect(sendAfterOutbox === reservedUntilDate).toBeTruthy();

          const payloadObject = JSON.parse(outbox.payload);

          expect(payloadObject).toEqual(
            expect.objectContaining({
              ...JSON.parse(expectedPayload),
              operationUuid: expect.any(String),
            }),
          );
        });
    });
  });

  describe('Handling payment webhooks', () => {
    it(`should get a validation error if request verification fails`, async () => {
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
      await OrderPaymentFactory.create({ orderId: order.id, externalId: faker.random.word() });

      await request(app.getHttpServer())
        .post(`/api/v1/payments/webhook/${PaymentProviderType.Stripe}`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: 'Unable to extract timestamp and signatures from header',
            }),
          );
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to complete already completed order`, async () => {
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

      const externalId = 'cs_test_a12x7LB1DXvvKGfsHM3bmOOUkMpw520HUZABES28WgCDHZjof0E83SC7vl';
      const order = await OrderFactory.create({ buyerId: user.id, status: OrderStatus.Completed }, [
        { ticketTypeId: ticketType.id, quantity: 1 },
      ]);
      await OrderPaymentFactory.create({ orderId: order.id, externalId: externalId });

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

      await request(app.getHttpServer())
        .post(`/api/v1/payments/webhook/${PaymentProviderType.Stripe}`)
        .set('Content-Type', 'text/plain')
        .set('stripe-signature', webhookPayload)
        .send(Buffer.from(rawBody, 'utf-8'))
        .then(async (response) => {
          expect(response.body).toEqual({});
          expect(response.status).toBe(HttpStatus.OK);

          const createdTicket = await AppDataSource.manager.getRepository(Ticket).findOneBy({ id: MoreThan(0) });

          expect(createdTicket).toBeNull();

          const outbox = await AppDataSource.manager.getRepository(Outbox).findOneBy({ id: MoreThan(0) });

          expect(outbox).toBeNull();
        });
    });

    it(`should handle a successfull payment via webhook`, async () => {
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

      const externalId = 'cs_test_a12x7LB1DXvvKGfsHM3bmOOUkMpw520HUZABES28WgCDHZjof0E83SC7vl';
      const order = await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 3 }]);
      await OrderPaymentFactory.create({ orderId: order.id, externalId: externalId });

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

      await request(app.getHttpServer())
        .post(`/api/v1/payments/webhook/${PaymentProviderType.Stripe}`)
        .set('Content-Type', 'text/plain')
        .set('stripe-signature', webhookPayload)
        .send(Buffer.from(rawBody, 'utf-8'))
        .then(async (response) => {
          expect(response.body).toEqual({});
          expect(response.status).toBe(HttpStatus.OK);

          const updatedOrder = await orderService.findByUuid(order.uuid, Locale.en_US);
          const createdTicketsCount = await AppDataSource.manager
            .getRepository(Ticket)
            .count({ where: { id: MoreThan(0) } });

          expect(createdTicketsCount).toBe(3);
          const ticket1 = await ticketService.findById(1, Locale.en_US);
          const ticket2 = await ticketService.findById(2, Locale.en_US);
          const ticket3 = await ticketService.findById(3, Locale.en_US);

          expect(updatedOrder).toEqual(
            expect.objectContaining({
              uuid: order.uuid,
              status: OrderStatus.Paid,
              payment: expect.objectContaining({
                externalId,
                externalStatus: OrderPaymentStatus.Completed,
              }),
              primaryPurchases: expect.arrayContaining([
                expect.objectContaining({
                  ticketType: expect.objectContaining({
                    uuid: ticketType.uuid,
                  }),
                  quantity: 3,
                  tickets: expect.arrayContaining([
                    expect.objectContaining({
                      id: ticket1.id,
                    }),
                    expect.objectContaining({
                      id: ticket2.id,
                    }),
                    expect.objectContaining({
                      id: ticket3.id,
                    }),
                  ]),
                }),
              ]),
            }),
          );

          const ticketsCreateOutbox = await AppDataSource.manager
            .getRepository(Outbox)
            .find({ where: { eventName: TicketEventPattern.TicketCreate, status: OutboxStatus.Created } });

          expect(ticketsCreateOutbox.length).toBe(3);

          const expectedCreateTicket1Message = new TicketCreateMessage({
            ticket: { ...ticket1 },
            user: { ...ticket1.user },
          });

          const payloads = ticketsCreateOutbox.map((ticketOutbox) => JSON.parse(ticketOutbox.payload));

          expect(payloads).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                ticket: expect.objectContaining({
                  ...expectedCreateTicket1Message.ticket,
                  createdAt: String(ticket1.createdAt.toJSON()),
                  ticketType: expect.objectContaining({
                    name: ticket1.ticketType.name,
                    event: expect.objectContaining({
                      name: ticket1.ticketType.event.name,
                      createdAt: String(ticket1.ticketType.event.createdAt.toJSON()),
                    }),
                    createdAt: String(ticket1.ticketType.createdAt.toJSON()),
                  }),
                  user: expect.objectContaining({
                    createdAt: String(ticket1.user.createdAt.toJSON()),
                  }),
                }),
                user: expect.objectContaining({
                  ...expectedCreateTicket1Message.user,
                  createdAt: String(expectedCreateTicket1Message.user.createdAt.toJSON()),
                }),
                operationUuid: expect.any(String),
              }),
            ]),
          );

          const createdMessagesCount = await AppDataSource.manager.getRepository(Message).count();

          expect(createdMessagesCount).toEqual(2);

          const createdSmsMessage = await AppDataSource.manager
            .getRepository(Message)
            .findOne({ where: { channel: MessageChannel.SMS }, relations: ['ticket', 'ticket.user'] });

          expect(createdSmsMessage).toEqual(
            expect.objectContaining({
              type: MessageType.TicketLink,
              channel: MessageChannel.SMS,
              content: `Your tickets link https://ticket.valicit.com/${ticket1.purchaseId}`,
              status: MessageStatus.Created,
              purchaseId: ticket1.purchaseId,
            }),
          );

          const createdEmailMessage = await AppDataSource.manager
            .getRepository(Message)
            .findOne({ where: { channel: MessageChannel.Email }, relations: ['ticket', 'ticket.user'] });

          expect(createdEmailMessage).toEqual(
            expect.objectContaining({
              type: MessageType.TicketLink,
              channel: MessageChannel.Email,
              content: `https://ticket.valicit.com/${ticket1.purchaseId}`,
              status: MessageStatus.Created,
              purchaseId: ticket1.purchaseId,
            }),
          );

          const emitedSmsMessage = new MessageSendMessage({
            messageUuid: createdSmsMessage.uuid,
            type: createdSmsMessage.type,
            channel: createdSmsMessage.channel,
            content: createdSmsMessage.content,
            sendTo: createdSmsMessage.sendTo,
          });

          const emitedEmailMessage = new MessageSendMessage({
            messageUuid: createdEmailMessage.uuid,
            type: createdEmailMessage.type,
            channel: createdEmailMessage.channel,
            content: createdEmailMessage.content,
            sendTo: createdEmailMessage.sendTo,
          });

          const outboxItems = await AppDataSource.manager
            .getRepository(Outbox)
            .find({ where: { eventName: MessageEventPattern.Send } });
          const outboxPayloads = outboxItems.map((item) => JSON.parse(item.payload));

          expect(outboxPayloads).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                ...emitedSmsMessage,
                operationUuid: expect.any(String),
              }),
              expect.objectContaining({
                ...emitedEmailMessage,
                operationUuid: expect.any(String),
              }),
            ]),
          );
        });
    });

    it(`should handle a declined payment via webhook and cancel order`, async () => {
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

      const externalId = 'cs_test_a12x7LB1DXvvKGfsHM3bmOOUkMpw520HUZABES28WgCDHZjof0E83SC7vl';
      const order = await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
      await OrderPaymentFactory.create({ orderId: order.id, externalId: externalId });

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

      await request(app.getHttpServer())
        .post(`/api/v1/payments/webhook/${PaymentProviderType.Stripe}`)
        .set('Content-Type', 'text/plain')
        .set('stripe-signature', webhookPayload)
        .send(Buffer.from(rawBody, 'utf-8'))
        .then(async (response) => {
          expect(response.body).toEqual({});
          expect(response.status).toBe(HttpStatus.OK);

          const updatedOrder = await orderService.findByUuid(order.uuid, Locale.en_US);
          expect(updatedOrder).toEqual(
            expect.objectContaining({
              uuid: order.uuid,
              status: OrderStatus.Canceled,
              payment: expect.objectContaining({
                externalId,
                externalStatus: OrderPaymentStatus.Declined,
              }),
              primaryPurchases: expect.arrayContaining([
                expect.objectContaining({
                  ticketType: expect.objectContaining({
                    uuid: ticketType.uuid,
                  }),
                  quantity: 1,
                  tickets: [],
                }),
              ]),
            }),
          );
        });
    });
  });
});
