import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TestHelper } from '@app/common/helpers/test.helper';
import { AppBootstrapManager } from '@web/app-bootstrap.manager';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketStatus } from '@app/ticket/ticket.types';
import { EventFactory } from '@app/database/factories/event.factory';
import { ListingFactory } from '@app/database/factories/listing.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { ListingStatus } from '@app/listing/listing.types';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { DATE_FORMAT, TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { DateTime } from 'luxon';
import { MarketType } from '@app/common/types/market-type.enum';
import { CurrencyEnum } from '@app/common/types/currency.enum';

describe('Events (e2e)', () => {
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

  it('should get list of events on a secondary market', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event1 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event1.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event1.id,
    });

    await ListingFactory.create({ ticketId: ticket.id, userId: user.id, eventId: event1.id });
    await ListingFactory.create({
      ticketId: ticket.id,
      userId: user.id,
      status: ListingStatus.Sold,
      eventId: event2.id,
    });
    await ListingFactory.create({
      ticketId: ticket.id,
      userId: user.id,
      status: ListingStatus.Canceled,
      marketType: 'secondary',
      eventId: event2.id,
    });

    await request(app.getHttpServer())
      .get('/api/v1/events')
      .query({
        marketType: MarketType.Secondary,
      })
      .set('Accept', 'application/json')
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: event1.uuid,
            }),
            expect.not.objectContaining({
              uuid: event2.uuid,
            }),
          ]),
        );
        expect(response.status).toEqual(HttpStatus.OK);
      });
  });

  it('should get list of events on a primary market', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event1 = await EventFactory.create({
      ticketProviderId: ticketProvider.id,
      dateStart: DateTime.now().plus({ days: 30 }).toUTC().toFormat(DATE_FORMAT),
      dateEnd: DateTime.now().plus({ days: 45 }).toUTC().toFormat(DATE_FORMAT),
    });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event3 = await EventFactory.create({ ticketProviderId: ticketProvider.id });

    const ticketType = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '100.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event1.id,
      ticketDateStart: DateTime.now().plus({ days: 30 }).toJSDate(),
      ticketDateEnd: DateTime.now().plus({ days: 35 }).toJSDate(),
    });

    const ticketType2 = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Disabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '100.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event2.id,
    });

    const ticketTyp3 = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 2 }).toJSDate(),
      saleEnabledToDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      salePrice: '100.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event3.id,
    });

    const ticketType4 = await TicketTypeFactory.create({
      saleEnabled: TicketTypeSaleStatus.Enabled,
      saleAmount: 4,
      saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
      saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
      salePrice: '150.00',
      saleCurrency: CurrencyEnum.AED,
      eventId: event1.id,
      ticketDateStart: DateTime.now().plus({ days: 40 }).toJSDate(),
      ticketDateEnd: DateTime.now().plus({ days: 45 }).toJSDate(),
    });

    await request(app.getHttpServer())
      .get('/api/v1/events')
      .query({
        marketType: MarketType.Primary,
      })
      .set('Accept', 'application/json')
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: event1.uuid,
              ticketsInformation: expect.objectContaining({
                primary: {
                  startingPrice: {
                    amount: '100.00',
                    currency: CurrencyEnum.AED,
                  },
                },
              }),
              dateStart: DateTime.now().plus({ days: 30 }).toUTC().toFormat(DATE_FORMAT),
              dateEnd: DateTime.now().plus({ days: 45 }).toUTC().toFormat(DATE_FORMAT),
            }),
            expect.not.objectContaining({
              uuid: event2.uuid,
            }),
            expect.not.objectContaining({
              uuid: event3.uuid,
            }),
          ]),
        );
        expect(response.status).toEqual(HttpStatus.OK);
      });
  });
});
