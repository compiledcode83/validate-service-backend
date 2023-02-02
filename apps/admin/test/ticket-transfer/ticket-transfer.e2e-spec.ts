import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { TicketTransferFactory } from '@app/database/factories/ticket-transfer.factory';
import { TicketTransferStatus } from '@app/ticket-transfer/ticket-transfer.types';

describe('Ticket Transfer (e2e)', () => {
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

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Checks that endpoint throws unauthorized error', () => {
    request(app.getHttpServer()).get('/api/v1/ticket-transfers').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).get('/api/v1/ticket-transfers/test').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).post('/api/v1/ticket-transfers').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should post a ticket transfer and return validation errors in response', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketData = {};

    await request(app.getHttpServer())
      .post('/api/v1/ticket-transfers')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'ticketProviderId must be an integer number',
            'ticketId must be an integer number',
            'ticketProviderId must be an integer number',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`should post a ticket transfer data and get successful data back in response`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    const ticketTransfer = {
      userId: user2.id,
      ticketProviderId: ticketProvider.id,
      ticketId: ticket.id,
    };

    await request(app.getHttpServer())
      .post('/api/v1/ticket-transfers')
      .send(ticketTransfer)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            status: TicketTransferStatus.InProgress,
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });

  it(`should get ticket transfers by pagination`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    const ticketTransfer2 = await TicketTransferFactory.create({
      ticketProviderId: ticketProvider.id,
      userIdTo: user2.id,
      ticketId: ticket.id,
      userIdFrom: user.id,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-transfers?limit=1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ...ticketTransfer2,
            }),
          ]),
        );
      });
  });

  it(`should get a ticket transfer data by id`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });
    const ticketTransfer = await TicketTransferFactory.create({
      ticketProviderId: ticketProvider.id,
      userIdFrom: user.id,
      userIdTo: user2.id,
      ticketId: ticket.id,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-transfers/${ticketTransfer.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...ticketTransfer,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
