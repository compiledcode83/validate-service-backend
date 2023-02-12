import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { faker } from '@faker-js/faker';
import { UserFactory } from '@app/database/factories/user.factory';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { EventFactory } from '@app/database/factories/event.factory';

describe('Ticket (e2e)', () => {
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
    request(app.getHttpServer()).get('/api/v1/tickets').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).get('/api/v1/tickets/test').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).post('/api/v1/tickets').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).patch('/api/v1/tickets').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).delete('/api/v1/tickets').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should post a ticket and return validation errors in response', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketData = {};

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining(['ticketProviderId must be an integer number', 'Ticket provider is not valid.']),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it.skip(`should post a ticket for existing user and get it back in response`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });
    const ticketData = {
      additionalData: JSON.stringify({ id: 0 }),
      ticketProviderId: ticketProvider.id,
      user: { userId: user.id },
      eventId: event.id,
      ticketTypeUuid: ticketType.uuid,
    };

    const expectedResponse = {
      ticketProviderId: ticketData.ticketProviderId,
      additionalData: ticketData.additionalData,
      deletedAt: null,
      errorData: null,
      userId: user.id,
      eventId: expect.any(Number),
      ticketTypeUuid: ticketType.uuid,
      ticketTypeId: ticketType.id,
      user: {
        ...user,
      },
    };

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...expectedResponse,
            id: response.body.id,
            tokenId: response.body.tokenId,
            hash: response.body.hash,
            transactionHash: response.body.transactionHash,
            imageUrl: response.body.imageUrl,
            ticketTypeId: response.body.ticketTypeId,
            validatedAt: response.body.validatedAt,
            user: {
              ...expectedResponse.user,
              createdAt: response.body.user.createdAt,
              updatedAt: null,
            },
            uuid: response.body.uuid,
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });

  it(`should post a ticket for new user and get it back in response`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });

    const ticketData = {
      additionalData: JSON.stringify({ id: 0 }),
      ticketProviderId: ticketProvider.id,
      user: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        phoneNumber: '+923244081140',
      },
      eventId: event.id,
      ticketTypeUuid: ticketType.uuid,
    };

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            contractId: response.body.contractId,
            deletedAt: null,
            ticketType: expect.objectContaining({
              uuid: ticketType.uuid,
            }),
            user: expect.objectContaining({
              name: ticketData.user.name,
            }),
            ticketProviderId: ticketType.id,
            uuid: expect.any(String),
            eventId: event.id,
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });

  it(`should get ticket by pagination`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });
    const ticket2 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/tickets`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticket.uuid,
              ticketProvider: expect.objectContaining({ uuid: ticketProvider.uuid }),
              user: expect.objectContaining({ uuid: user.uuid }),
            }),
            expect.objectContaining({
              uuid: ticket2.uuid,
              ticketProvider: expect.objectContaining({ uuid: ticketProvider.uuid }),
              user: expect.objectContaining({ uuid: user.uuid }),
            }),
          ]),
        );
      });
  });

  it.skip('Should update a ticket and get updated data in response', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });
    const updatedTicket = {
      ticketProviderId: ticket.ticketProviderId,
      ticketTypeUuid: ticketType.uuid,
      eventId: ticket.eventId,
      userId: user.id,
      imageUrl: 'https://wwww.google.com',
    };

    await request(app.getHttpServer())
      .patch(`/api/v1/tickets/${ticket.id}`)
      .send(updatedTicket)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...ticket,
            id: ticket.id,
            eventId: ticket.eventId,
            status: 'creating',
            updatedAt: null,
            createdAt: response.body.createdAt,
            additionalData: response.body.additionalData,
            ticketTypeId: response.body.ticketTypeId,
            imageUrl: updatedTicket.imageUrl,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get a ticket by id`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/tickets/${ticket.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...ticket,
            eventId: expect.any(Number),
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should delete a ticket by id`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/tickets/${ticket.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
