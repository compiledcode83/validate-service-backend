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
import { MessageFactory } from '@app/database/factories/message.factory';
import { RedeemFactory } from '@app/database/factories/redeem.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { RedeemMode } from '@app/redeem/redeem.types';
import { faker } from '@faker-js/faker';

describe('Message e2e', () => {
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
    request(app.getHttpServer()).get('/api/v1/messages').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should get messages by pagination', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });
    const redeem = await RedeemFactory.create({
      purchaseId: ticket.purchaseId,
      mode: RedeemMode.Individual,
      userId: user.id,
    });

    const message = await MessageFactory.create({
      ticketId: ticket.id,
      userId: user.id,
      purchaseId: ticket.purchaseId,
      redeemId: redeem.id,
      sendTo: faker.internet.email(),
    });

    const message1 = await MessageFactory.create({
      ticketId: ticket.id,
      userId: user.id,
      purchaseId: ticket.purchaseId,
      redeemId: redeem.id,
      sendTo: faker.internet.email(),
    });

    await request(app.getHttpServer())
      .get(`/api/v1/messages?limit=1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: message1.id,
            }),
          ]),
        );

        const afterCursor = response.body.cursor.afterCursor;

        await request(app.getHttpServer())
          .get(`/api/v1/messages?limit=1&afterCursor=${afterCursor}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .then((response) => {
            expect(response.body.data).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: message.id,
                }),
              ]),
            );
          });
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('Should get one message with the provided uuid', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });
    const redeem = await RedeemFactory.create({
      purchaseId: ticket.purchaseId,
      mode: RedeemMode.Individual,
      userId: user.id,
    });

    const message = await MessageFactory.create({
      ticketId: ticket.id,
      userId: user.id,
      purchaseId: ticket.purchaseId,
      redeemId: redeem.id,
      sendTo: faker.internet.email(),
    });

    await request(app.getHttpServer())
      .get(`/api/v1/messages/${message.uuid}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect.objectContaining({
          id: message.id,
          uuid: message.uuid,
        });
      });
  });
});
