import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { ListingFactory } from '@app/database/factories/listing.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { AppDataSource } from '@app/common/configs/datasource';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { ListingStatus } from '@app/listing/listing.types';

describe('Listing e2e', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;

  beforeAll(async () => {
    moduleFixture = await AppBootstrapManager.getTestingModule();
    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app);
    await AppDataSource.initialize();
    testHelper = new TestHelper(moduleFixture, jest);
    await app.init();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Checks that endpoint throws unauthorized error', () => {
    request(app.getHttpServer()).get('/api/v1/listings').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should get listing by pagination', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();

    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    const listing1 = await ListingFactory.create({
      userId: user.id,
      ticketId: ticket.id,
      eventId: event.id,
      status: ListingStatus.Active,
    });

    const listing2 = await ListingFactory.create({
      userId: user.id,
      ticketId: ticket.id,
      eventId: event.id,
      status: ListingStatus.Active,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/listings?limit=1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: listing2.id,
            }),
          ]),
        );

        const afterCursor = response.body.cursor.afterCursor;

        await request(app.getHttpServer())
          .get(`/api/v1/listings?limit=1&afterCursor=${afterCursor}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .then((response) => {
            expect(response.body.data).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: listing1.id,
                }),
              ]),
            );
          });
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('Should Cancel Listing', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();

    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    const listing1 = await ListingFactory.create({
      userId: user.id,
      ticketId: ticket.id,
      eventId: event.id,
      status: ListingStatus.Active,
    });

    const listingData = {
      listingUuid: listing1.uuid,
      userUuid: user.uuid,
    };

    await request(app.getHttpServer())
      .post(`/api/v1/listings`)
      .send(listingData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
