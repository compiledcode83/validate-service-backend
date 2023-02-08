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
import { RedeemFactory } from '@app/database/factories/redeem.factory';
import { RedeemMode } from '@app/redeem/redeem.types';

describe('Redeem e2e', () => {
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
    // await testHelper.cleanDatabase();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Checks that endpoint throws unauthorized error', () => {
    request(app.getHttpServer()).get('/api/v1/redeems').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should get list of Redeems with user phone filtered', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user1 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    const redeem1 = await RedeemFactory.create({
      purchaseId: ticket.purchaseId,
      userId: user.id,
      mode: RedeemMode.Individual,
    });

    const redeem2 = await RedeemFactory.create({
      purchaseId: ticket.purchaseId,
      userId: user1.id,
      mode: RedeemMode.Individual,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/redeems?limit=1&userPhoneNumber=${user.phoneNumber.split('+')[1]}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: redeem1.id,
            }),
          ]),
        );
      });
  });

  it('Should get redeem by uuid', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user1 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    const redeem1 = await RedeemFactory.create({
      purchaseId: ticket.purchaseId,
      userId: user.id,
      mode: RedeemMode.Individual,
    });
    const redeem2 = await RedeemFactory.create({
      purchaseId: ticket.purchaseId,
      userId: user1.id,
      mode: RedeemMode.Individual,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/redeems/${redeem1.uuid}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: redeem1.id,
            uuid: redeem1.uuid,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
