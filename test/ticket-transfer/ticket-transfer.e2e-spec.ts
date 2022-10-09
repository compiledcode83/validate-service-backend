import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@src/app-bootstrap.manager';
import { UserFactory } from '@src/database/factories/user.factory';
import { AppDataSource } from '@src/config/datasource';
import { TicketProviderFactory } from '@src/database/factories/ticket-provider.factory';
import { TestHelper } from '@test/helpers/test.helper';
import { TicketFactory } from '@src/database/factories/ticket.factory';
import { TicketTransfer } from '@src/ticket-transfer/ticket-transfer.entity';
import { TicketTransferFactory } from '@src/database/factories/ticket-transfer.factory';
import { KAFKA_PRODUCER_TOKEN } from '@src/producer/producer.types';

describe('Ticket-transfer (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let mockedClientKafka: jest.Mock;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
    mockedClientKafka = jest.fn().mockImplementation(() => ({
      connect: () => jest.fn().mockImplementation(() => Promise.resolve()),
      close: () => jest.fn().mockImplementation(() => Promise.resolve()),
      emit: () => jest.fn().mockImplementation(() => Promise.resolve()),
    }));

    testingModuleBuilder.overrideProvider(KAFKA_PRODUCER_TOKEN).useClass(mockedClientKafka);
    moduleFixture = await testingModuleBuilder.compile();

    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app);
    testHelper = new TestHelper(moduleFixture, jest);
    await AppDataSource.initialize();
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

  it('checks that endpoints are protected', () => {
    request(app.getHttpServer()).get('/api/v1/ticket-transfers/1').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).post('/api/v1/ticket-transfers').expect(HttpStatus.UNAUTHORIZED);
  });

  it('should post a ticket transfer and get validation errors', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);

    await request(app.getHttpServer())
      .post('/api/v1/ticket-transfers')
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'userUuid must be a UUID',
            'User not found',
            'ticketUuid must be a UUID',
            'Ticket not found',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`should successfully create a new ticket transfer`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const userFrom = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const userTo = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: userFrom.id });

    await request(app.getHttpServer())
      .post('/api/v1/ticket-transfers')
      .send({
        userUuid: userTo.uuid,
        ticketUuid: ticket.uuid,
      })
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            createdAt: expect.any(String),
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);

        const ticketTransfer = await AppDataSource.manager
          .getRepository(TicketTransfer)
          .findOne({ where: { uuid: response.body.uuid } });

        expect(ticketTransfer.userIdFrom).toEqual(userFrom.id);
        expect(ticketTransfer.userIdTo).toEqual(userTo.id);
        expect(ticketTransfer.ticketId).toEqual(ticket.id);
        expect(ticketTransfer.ticketProviderId).toEqual(ticketProvider.id);
      });
  });

  it(`should not get ticket transfer by uuid, because it belongs to another ticket provider`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const ticketProviderSecond = await TicketProviderFactory.create();
    const userFrom = await UserFactory.create({ ticketProviderId: ticketProviderSecond.id });
    const userTo = await UserFactory.create({ ticketProviderId: ticketProviderSecond.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProviderSecond.id, userId: userFrom.id });
    const ticketTransfer = await TicketTransferFactory.create({
      ticketProviderId: ticketProviderSecond.id,
      userIdFrom: userFrom.id,
      userIdTo: userTo.id,
      ticketId: ticket.id,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-transfers/${ticketTransfer.uuid}`)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.message).toEqual('Ticket transfer not found');
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
  });

  it(`should get ticket by uuid successfully`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const userFrom = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const userTo = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: userFrom.id });
    const ticketTransfer = await TicketTransferFactory.create({
      ticketProviderId: ticketProvider.id,
      userIdFrom: userFrom.id,
      userIdTo: userTo.id,
      ticketId: ticket.id,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-transfers/${ticketTransfer.uuid}`)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: ticketTransfer.uuid,
            createdAt: expect.any(String),
            status: ticketTransfer.status,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
