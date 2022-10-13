import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@src/app-bootstrap.manager';
import { UserFactory } from '@src/database/factories/user.factory';
import { AppDataSource } from '@src/config/datasource';
import { TicketProviderFactory } from '@src/database/factories/ticket-provider.factory';
import { TestHelper } from '@test/helpers/test.helper';
import { faker } from '@faker-js/faker';
import { Ticket } from '@src/ticket/ticket.entity';
import { TicketFactory } from '@src/database/factories/ticket.factory';
import { TicketStatus } from '@src/ticket/ticket.types';
import { ProducerService } from '@src/producer/producer.service';

describe('Ticket (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();

    testingModuleBuilder.overrideProvider(ProducerService).useValue({
      emit: () => jest.fn().mockImplementation(() => Promise.resolve()),
    });

    moduleFixture = await testingModuleBuilder.compile();

    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app);
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
    jest.restoreAllMocks();
  });

  it('checks that endpoints are protected', () => {
    request(app.getHttpServer()).get('/api/v1/tickets/1').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).post('/api/v1/tickets').expect(HttpStatus.UNAUTHORIZED);
  });

  it('should post a ticket and get validation errors', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send({
        imageUrl: 'not a url',
        additionalData: 'not an object',
      })
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'userUuid must be a UUID',
            'User not found',
            'name must be shorter than or equal to 255 characters',
            'imageUrl must be an URL address',
            'additionalData must be an object',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`should successfully create a new ticket`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketData = {
      name: faker.random.words(4),
      imageUrl: faker.internet.url(),
      additionalData: {
        seats: 4,
        type: 'Adult',
      },
      userUuid: user.uuid,
    };

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            name: ticketData.name,
            imageUrl: ticketData.imageUrl,
            additionalData: ticketData.additionalData,
            status: TicketStatus.Creating,
            contractId: null,
            ipfsUri: null,
            tokenId: null,
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);

        const newTicket = await AppDataSource.manager
          .getRepository(Ticket)
          .findOne({ where: { uuid: response.body.uuid } });

        expect(newTicket.ticketProviderId).toEqual(ticketProvider.id);
        expect(newTicket.userId).toEqual(user.id);
      });
  });

  it(`should not get ticket by uuid, because it belongs to another ticket provider`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const ticketProviderSecond = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProviderSecond.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProviderSecond.id, userId: user.id });

    await request(app.getHttpServer())
      .get(`/api/v1/tickets/${ticket.uuid}`)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.message).toEqual('Ticket not found');
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
  });

  it(`should get ticket by uuid successfully`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    await request(app.getHttpServer())
      .get(`/api/v1/tickets/${ticket.uuid}`)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: ticket.uuid,
            name: ticket.name,
            imageUrl: ticket.imageUrl,
            additionalData: ticket.additionalData,
            status: TicketStatus.Creating,
            contractId: ticket.contractId,
            ipfsUri: ticket.ipfsUri,
            tokenId: ticket.tokenId,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get a list of tickets filtered by user uuid`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const ticket2 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user2.id,
      status: TicketStatus.Active,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/search`)
      .send({
        userUuid: user.uuid,
      })
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticket.uuid,
            }),
            expect.not.objectContaining({
              uuid: ticket2.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get a list of tickets filtered by seed phrase`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const ticket2 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user2.id,
      status: TicketStatus.Active,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/search`)
      .send({
        seedPhrase: user2.seedPhrase,
      })
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.not.objectContaining({
              uuid: ticket.uuid,
            }),
            expect.objectContaining({
              uuid: ticket2.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get a list of tickets filtered by status, active by default`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const ticket2 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Validated,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/search`)
      .send({
        seedPhrase: user.seedPhrase,
      })
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticket.uuid,
            }),
            expect.not.objectContaining({
              uuid: ticket2.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/search`)
      .send({
        seedPhrase: user.seedPhrase,
        status: TicketStatus.Validated,
      })
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.not.objectContaining({
              uuid: ticket.uuid,
            }),
            expect.objectContaining({
              uuid: ticket2.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`doesn't allow to validate the ticket if it's status isn't active`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Validated,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/${ticket.uuid}/validate`)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Ticket is already used or not created yet']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`doesn't allow to validate the ticket if it doesn't belong to ticket provider`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const ticketProviderSecond = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProviderSecond.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProviderSecond.id,
      userId: user.id,
      status: TicketStatus.Active,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/${ticket.uuid}/validate`)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Ticket is already used or not created yet']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`validates active ticket successfully`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/${ticket.uuid}/validate`)
      .set('Accept', 'application/json')
      .set('api-token', token)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: ticket.uuid,
            status: TicketStatus.Validated,
            validatedAt: expect.any(String),
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
