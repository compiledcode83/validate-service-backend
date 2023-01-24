import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestHelper } from '@app/common/helpers/test.helper';
import { AppBootstrapManager } from '@web/app-bootstrap.manager';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { DateTime } from 'luxon';
import { OrderFactory } from '@app/database/factories/order.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { OrderStatus } from '@app/order/order.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';

describe('Ticket-types (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
    moduleFixture = await testingModuleBuilder.compile();

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

  it('should get a list of ticket types for a specific event', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
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
      salePrice: '125.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event2.id,
    });
    const ticketType3 = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 10,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '125.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event.id,
    });

    await OrderFactory.create({ buyerId: user.id, status: OrderStatus.Created }, [
      { ticketTypeId: ticketType1.id, quantity: 2 },
    ]);

    await request(app.getHttpServer())
      .get('/api/v1/ticket-types')
      .query({
        eventUuid: event.uuid,
      })
      .set('Accept', 'application/json')
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticketType1.uuid,
              saleAmountAvailable: 2,
            }),
            expect.objectContaining({
              uuid: ticketType3.uuid,
              saleAmountAvailable: 10,
            }),
            expect.not.objectContaining({
              uuid: ticketType2.uuid,
            }),
          ]),
        );
      });
  });
});
