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
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { ListingFactory } from '@app/database/factories/listing.factory';
import { ListingStatus } from '@app/listing/listing.types';
import { faker } from '@faker-js/faker';
import { EventFactory } from '@app/database/factories/event.factory';
import { DateTime } from 'luxon';
import { RedeemFactory } from '@app/database/factories/redeem.factory';
import { CurrencyEnum } from '@app/common/types/currency.enum';

describe('Listing (e2e)', () => {
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

  it('should post a new ticket for sale and get the validation error of ticket is already in redeeming process', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const token = await testHelper.setWebAuthenticatedUser(user);
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const ticketRedeem = await RedeemFactory.create({ purchaseId: ticket.purchaseId, userId: user.id });
    const userAgent = faker.internet.userAgent();

    const listingData = {
      ticketUuid: ticket.uuid,
      buyNowPrice: '1300',
      buyNowCurrency: CurrencyEnum.USD,
      marketType: 'secondary',
      status: ListingStatus.Active,
      endsAt: DateTime.now().plus({ days: 1 }).toUTC().toISO(),
    };

    await request(app.getHttpServer())
      .post('/api/v1/listings')
      .send(listingData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .set('User-agent', userAgent)
      .then((res) => {
        expect(res.body.message).toEqual(['Ticket is in redeeming process']);
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('should post a new listing and get back in response', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const token = await testHelper.setWebAuthenticatedUser(user);
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const userAgent = faker.internet.userAgent();

    const listingData = {
      ticketUuid: ticket.uuid,
      buyNowPrice: '1300',
      buyNowCurrency: CurrencyEnum.USD,
      marketType: 'secondary',
      status: ListingStatus.Active,
      endsAt: DateTime.now().plus({ days: 1 }).toUTC().toISO(),
    };
    await request(app.getHttpServer())
      .post('/api/v1/listings')
      .send(listingData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .set('User-agent', userAgent)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({ ...listingData }));
        expect(res.status).toBe(HttpStatus.CREATED);
      });
  });

  it('should get listing by pagination', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const listing1 = await ListingFactory.create({ ticketId: ticket.id, userId: user.id, eventId: event.id });
    const listing2 = await ListingFactory.create({ ticketId: ticket.id, userId: user.id, eventId: event2.id });

    await request(app.getHttpServer())
      .get('/api/v1/listings')
      .query({
        eventUuid: event.uuid,
      })
      .set('Accept', 'application/json')
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: listing1.id,
            }),
            expect.not.objectContaining({
              id: listing2.id,
            }),
          ]),
        );
      });
  });

  it('should cancel the active listing', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const token = await testHelper.setWebAuthenticatedUser(user);
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const userAgent = faker.internet.userAgent();

    const listing = await ListingFactory.create({ ticketId: ticket.id, userId: user.id });

    await request(app.getHttpServer())
      .post(`/api/v1/listings/${listing.uuid}/cancel`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .set('User-agent', userAgent)
      .then((res) => {
        expect(res.status).toBe(HttpStatus.OK);
      });
  });
});
