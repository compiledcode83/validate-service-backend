import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
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
import { OrderMarketType, OrderStatus } from '@app/order/order.types';
import { ConfigService } from '@nestjs/config';
import { CurrencyEnum } from '@app/common/types/currency.enum';

describe('Order (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let configService: ConfigService;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
    moduleFixture = await testingModuleBuilder.compile();
    configService = moduleFixture.get<ConfigService>(ConfigService);

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

  describe('Primary market', () => {
    it(`should respond with validation error when creating a new order for a primary market`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);

      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          marketType: OrderMarketType.Primary,
          ticketTypes: 'invalid',
        })
        .then((response) => {
          expect(response.body.message).toEqual([
            'ticketTypes.each value in nested property ticketTypes must be either object or array',
          ]);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a new order if the sale was disabled`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Disabled,
        saleAmount: 100,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        eventId: event.id,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          ticketTypes: [
            {
              ticketTypeUuid: ticketType.uuid,
              quantity: 1,
            },
          ],
          marketType: OrderMarketType.Primary,
        })
        .then((response) => {
          expect(response.body.message).toEqual('Sale for this ticket type is not enabled');
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a new order if the sale dates ended`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 100,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().minus({ week: 1 }).toJSDate(),
        eventId: event.id,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          ticketTypes: [
            {
              ticketTypeUuid: ticketType.uuid,
              quantity: 1,
            },
          ],
          marketType: OrderMarketType.Primary,
        })
        .then((response) => {
          expect(response.body.message).toEqual('Sale for this ticket type is not enabled');
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a new order if the initial sale amount is lower that buying request`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 10,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        eventId: event.id,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          ticketTypes: [
            {
              ticketTypeUuid: ticketType.uuid,
              quantity: 11,
            },
          ],
          marketType: OrderMarketType.Primary,
        })
        .then((response) => {
          expect(response.body.message).toEqual('One or more tickets are unavailable');
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a new order if the remaining sale amount is lower that buying request`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 3,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        eventId: event.id,
      });

      await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
      await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);

      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          ticketTypes: [
            {
              ticketTypeUuid: ticketType.uuid,
              quantity: 2,
            },
          ],
          marketType: OrderMarketType.Primary,
        })
        .then((response) => {
          expect(response.body.message).toEqual('One or more tickets are unavailable');
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`creates a new order successfully`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '100.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const buyingQuantity = 2;

      await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);
      await OrderFactory.create({ buyerId: user.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);

      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          ticketTypes: [
            {
              ticketTypeUuid: ticketType.uuid,
              quantity: buyingQuantity,
            },
          ],
          marketType: OrderMarketType.Primary,
        })
        .then(async (response) => {
          const orderFinalPrice = Number(ticketType.salePrice) * buyingQuantity;

          expect(response.body).toEqual(
            expect.objectContaining({
              uuid: expect.any(String),
              seller: null,
              buyer: expect.objectContaining({
                uuid: user.uuid,
              }),
              marketType: OrderMarketType.Primary,
              salePrice: `${String(orderFinalPrice)}.00`,
              saleCurrency: ticketType.saleCurrency,
              status: OrderStatus.Created,
              primaryPurchases: expect.arrayContaining([
                expect.objectContaining({
                  ticketType: expect.objectContaining({
                    uuid: ticketType.uuid,
                  }),
                  tickets: [],
                  quantity: buyingQuantity,
                }),
              ]),
            }),
          );
          expect(response.status).toBe(HttpStatus.CREATED);

          const reservedUntilDate = DateTime.fromISO(response.body.reservedUntil);
          const createdAtDate = DateTime.fromISO(response.body.createdAt);
          const diffInMinutes = Math.floor(reservedUntilDate.diff(createdAtDate).as('minutes'));
          const reservationInMinutes = configService.get('orderConfig.primarySaleReservationMinutes');

          expect(diffInMinutes).toBe(reservationInMinutes);
        });
    });

    it(`creates a new order for multiple ticket types successfully`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 20,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '100.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const ticketType2 = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 100,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '120.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const buyingQuantity1 = 2;
      const buyingQuantity2 = 4;

      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send({
          ticketTypes: [
            {
              ticketTypeUuid: ticketType.uuid,
              quantity: buyingQuantity1,
            },
            {
              ticketTypeUuid: ticketType2.uuid,
              quantity: buyingQuantity2,
            },
          ],
          marketType: OrderMarketType.Primary,
        })
        .then((response) => {
          const orderFinalPrice =
            Number(ticketType.salePrice) * buyingQuantity1 + Number(ticketType2.salePrice) * buyingQuantity2;

          expect(response.body).toEqual(
            expect.objectContaining({
              uuid: expect.any(String),
              seller: null,
              buyer: expect.objectContaining({
                uuid: user.uuid,
              }),
              marketType: OrderMarketType.Primary,
              salePrice: `${String(orderFinalPrice)}.00`,
              saleCurrency: ticketType.saleCurrency,
              status: OrderStatus.Created,
              primaryPurchases: expect.arrayContaining([
                expect.objectContaining({
                  ticketType: expect.objectContaining({
                    uuid: ticketType.uuid,
                  }),
                  tickets: [],
                  quantity: buyingQuantity1,
                }),
                expect.objectContaining({
                  ticketType: expect.objectContaining({
                    uuid: ticketType2.uuid,
                  }),
                  tickets: [],
                  quantity: buyingQuantity2,
                }),
              ]),
            }),
          );
          expect(response.status).toBe(HttpStatus.CREATED);

          const reservedUntilDate = DateTime.fromISO(response.body.reservedUntil);
          const createdAtDate = DateTime.fromISO(response.body.createdAt);
          const diffInMinutes = Math.floor(reservedUntilDate.diff(createdAtDate).as('minutes'));
          const reservationInMinutes = configService.get('orderConfig.primarySaleReservationMinutes');

          expect(diffInMinutes).toBe(reservationInMinutes);
        });
    });
  });

  describe('Order information', () => {
    it(`should get a 404 if order user is different from the requesting one`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '100.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });

      const order = await OrderFactory.create({ buyerId: user2.id }, [{ ticketTypeId: ticketType.id, quantity: 1 }]);

      await request(app.getHttpServer())
        .get(`/api/v1/orders/${order.uuid}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.status).toBe(HttpStatus.NOT_FOUND);
        });
    });

    it(`should get order's information`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const token = await testHelper.setWebAuthenticatedUser(user);
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

      await request(app.getHttpServer())
        .get(`/api/v1/orders/${order.uuid}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              uuid: expect.any(String),
              seller: null,
              buyer: expect.objectContaining({
                uuid: user.uuid,
              }),
              marketType: OrderMarketType.Primary,
              salePrice: order.salePrice,
              saleCurrency: order.saleCurrency,
              status: OrderStatus.Created,
              primaryPurchases: expect.arrayContaining([
                expect.objectContaining({
                  ticketType: expect.objectContaining({
                    uuid: ticketType.uuid,
                  }),
                  tickets: [],
                  quantity: 1,
                }),
              ]),
            }),
          );
          expect(response.status).toBe(HttpStatus.OK);
        });
    });
  });
});
