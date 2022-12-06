import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DateTime } from 'luxon';
import { AppBootstrapManager } from '@src/app-bootstrap.manager';
import { UserFactory } from '@src/database/factories/user.factory';
import { AppDataSource } from '@src/config/datasource';
import { TicketProviderFactory } from '@src/database/factories/ticket-provider.factory';
import { TestHelper } from '@test/helpers/test.helper';
import { faker } from '@faker-js/faker';
import { Ticket } from '@src/ticket/ticket.entity';
import { TicketFactory } from '@src/database/factories/ticket.factory';
import { TicketEventPattern, TicketStatus } from '@src/ticket/ticket.types';
import { TicketProviderSecurityLevel } from '@src/ticket-provider/ticket-provider.types';
import { TicketCreateMessage } from '@src/ticket/messages/ticket-create.message';
import { TicketProviderEncryptionKeyFactory } from '@src/database/factories/ticket-provider-encryption-key.factory';
import { TicketProviderEncryptionService } from '@src/ticket-provider-encryption-key/ticket-provider-encryption.service';
import { TicketDeleteMessage } from '@src/ticket/messages/ticket-delete.message';
import { User } from '@src/user/user.entity';
import { MoreThan } from 'typeorm';
import { RedisService } from '@src/redis/redis.service';
import { Outbox } from '@src/outbox/outbox.entity';
import { OutboxStatus } from '@src/outbox/outbox.types';

describe('Ticket (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let redisService: RedisService;
  let ticketProviderEncryptionService: TicketProviderEncryptionService;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
    moduleFixture = await testingModuleBuilder.compile();
    redisService = moduleFixture.get<RedisService>(RedisService);
    ticketProviderEncryptionService = moduleFixture.get<TicketProviderEncryptionService>(
      TicketProviderEncryptionService,
    );

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
    jest.resetAllMocks();
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
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'name must be shorter than or equal to 255 characters',
            'imageUrl must be an URL address',
            'additionalData must be an object',
            'type must be shorter than or equal to 64 characters',
            'Acceptable date format is yyyy-MM-dd.',
            'user.name must be shorter than or equal to 128 characters',
            'user.email must be shorter than or equal to 255 characters',
            'user.phoneNumber must be a valid phone number',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`should successfully create a new ticket for existing user`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketData = {
      name: faker.random.words(4),
      type: faker.random.word(),
      dateStart: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      dateEnd: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      imageUrl: faker.internet.url(),
      additionalData: {
        seats: 4,
        type: 'Adult',
      },
      user: {
        uuid: user.uuid,
      },
    };

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            name: ticketData.name,
            type: ticketData.type,
            dateStart: ticketData.dateStart,
            dateEnd: ticketData.dateEnd,
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

  it(`should successfully create a new ticket and a new user`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const ticketData = {
      name: faker.random.words(4),
      type: faker.random.word(),
      dateStart: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      dateEnd: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      imageUrl: faker.internet.url(),
      additionalData: {
        seats: 4,
        type: 'Adult',
      },
      user: {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number('+4891#######'),
      },
    };

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            name: ticketData.name,
            type: ticketData.type,
            dateStart: ticketData.dateStart,
            dateEnd: ticketData.dateEnd,
            imageUrl: ticketData.imageUrl,
            additionalData: ticketData.additionalData,
            status: TicketStatus.Creating,
            contractId: null,
            ipfsUri: null,
            tokenId: null,
            user: expect.objectContaining({
              uuid: expect.any(String),
              ...ticketData.user,
            }),
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);

        const newTicket = await AppDataSource.manager
          .getRepository(Ticket)
          .findOne({ where: { uuid: response.body.uuid } });

        const newUser = await AppDataSource.manager.getRepository(User).findOne({ where: { id: MoreThan(0) } });

        expect(newTicket.ticketProviderId).toEqual(ticketProvider.id);
        expect(newTicket.userId).toEqual(newUser.id);
      });
  });

  it(`should create a new ticket, without encrypted user data, if TP has level 1 security`, async () => {
    const ticketProvider = await TicketProviderFactory.create({ securityLevel: TicketProviderSecurityLevel.Level1 });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketData = {
      name: faker.random.words(4),
      type: faker.random.word(),
      dateStart: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      dateEnd: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      imageUrl: faker.internet.url(),
      additionalData: {
        seats: 4,
        type: 'Adult',
      },
      user: {
        uuid: user.uuid,
      },
    };

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            name: ticketData.name,
            type: ticketData.type,
            dateStart: ticketData.dateStart,
            dateEnd: ticketData.dateEnd,
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

        const expectedCreateTicketMessage = new TicketCreateMessage({
          ticket: { ...newTicket },
          user: { ...user },
        });

        const outbox = await AppDataSource.manager.getRepository(Outbox).findOneBy({ id: MoreThan(0) });

        expect(outbox).toEqual(
          expect.objectContaining({
            eventName: TicketEventPattern.TicketCreate,
            status: OutboxStatus.Created,
          }),
        );

        const payloadObject = JSON.parse(outbox.payload);

        expect(payloadObject).toEqual(
          expect.objectContaining({
            ticket: expect.objectContaining({
              ...expectedCreateTicketMessage.ticket,
              createdAt: String(newTicket.createdAt.toJSON()),
            }),
            user: expect.objectContaining({ ...expectedCreateTicketMessage.user }),
            operationUuid: expect.any(String),
          }),
        );
      });
  });

  it(`should create a new ticket, with encrypted user data, if TP has level 2 security`, async () => {
    const ticketProvider = await TicketProviderFactory.create({ securityLevel: TicketProviderSecurityLevel.Level2 });
    const encryptionKey = await TicketProviderEncryptionKeyFactory.create({
      ticketProviderId: ticketProvider.id,
      version: 1,
    });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketData = {
      name: faker.random.words(4),
      type: faker.random.word(),
      dateStart: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      dateEnd: DateTime.now().plus({ days: 10 }).toFormat('yyyy-MM-dd'),
      imageUrl: faker.internet.url(),
      additionalData: {
        seats: 4,
        type: 'Adult',
      },
      user: {
        uuid: user.uuid,
      },
    };

    await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketData)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: expect.any(String),
            name: ticketData.name,
            type: ticketData.type,
            dateStart: ticketData.dateStart,
            dateEnd: ticketData.dateEnd,
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

        const expectedCreateTicketMessage = new TicketCreateMessage({
          ticket: { ...newTicket },
          user: { ...user },
        });

        const outbox = await AppDataSource.manager.getRepository(Outbox).findOneBy({ id: MoreThan(0) });

        expect(outbox).toEqual(
          expect.objectContaining({
            eventName: TicketEventPattern.TicketCreate,
            status: OutboxStatus.Created,
          }),
        );

        const payloadObject = JSON.parse(outbox.payload);

        expect(payloadObject).toEqual(
          expect.objectContaining({
            ticket: expect.objectContaining({
              ...expectedCreateTicketMessage.ticket,
              createdAt: String(newTicket.createdAt.toJSON()),
            }),
            user: expect.objectContaining({ ...expectedCreateTicketMessage.user }),
            operationUuid: expect.any(String),
            encryptedData: expect.any(Object),
          }),
        );

        const decryptedUser = ticketProviderEncryptionService.decrypt(
          payloadObject.encryptedData,
          encryptionKey.secretKey,
        );

        expect(JSON.parse(decryptedUser)).toEqual({
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          photoUrl: user?.photoUrl ?? null,
        });
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
      .set('Api-Key', token)
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
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: ticket.uuid,
            name: ticket.name,
            imageUrl: ticket.imageUrl,
            additionalData: ticket.additionalData,
            status: TicketStatus.Active,
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
      .get(`/api/v1/tickets`)
      .send({
        userUuid: user.uuid,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticket.uuid,
              user: expect.objectContaining({
                uuid: user.uuid,
              }),
            }),
            expect.not.objectContaining({
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
      .get(`/api/v1/tickets`)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticket.uuid,
              user: expect.objectContaining({
                uuid: user.uuid,
              }),
            }),
            expect.not.objectContaining({
              uuid: ticket2.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/tickets`)
      .query({
        status: TicketStatus.Validated,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
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
    const hash = faker.random.alphaNumeric(16);

    await redisService.set(hash, ticket.uuid, 10);

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/validate`)
      .send({
        hash,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
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
    const hash = faker.random.alphaNumeric(16);

    await redisService.set(hash, ticket.uuid, 10);

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/validate`)
      .send({
        hash,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Ticket is already used or not created yet']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`doesn't allow to validate the ticket if hash is not present in redis`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const ticketProviderSecond = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProviderSecond.id });
    await TicketFactory.create({
      ticketProviderId: ticketProviderSecond.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const hash = faker.random.alphaNumeric(16);

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/validate`)
      .send({
        hash,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Hash value was not found']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`doesn't allow to validate the same hash more than once`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });
    const hash = faker.random.alphaNumeric(16);

    await redisService.set(hash, ticket.uuid, 10);

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/validate`)
      .send({
        hash,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
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

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/validate`)
      .send({
        hash,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: ['Ticket is already used or not created yet'],
          }),
        );
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
    const hash = faker.random.alphaNumeric(16);

    await redisService.set(hash, ticket.uuid, 10);

    await request(app.getHttpServer())
      .post(`/api/v1/tickets/validate`)
      .send({
        hash,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
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

  it(`doesn't allow to delete the ticket if it doesn't belong to ticket provider`, async () => {
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
      .delete(`/api/v1/tickets/${ticket.uuid}`)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Ticket not found or cannot be deleted']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`doesn't allow to delete the ticket if it's status isn't active`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Validated,
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/tickets/${ticket.uuid}`)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Ticket not found or cannot be deleted']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`deletes active ticket successfully`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
    });

    await request(app.getHttpServer())
      .delete(`/api/v1/tickets/${ticket.uuid}`)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.NO_CONTENT);

        const deletedTicket = await AppDataSource.manager
          .getRepository(Ticket)
          .findOne({ where: { uuid: response.body.uuid } });

        expect(deletedTicket.status).toEqual(TicketStatus.Deleted);
        expect(deletedTicket.deletedAt).not.toBeNull();

        const expectedMessage = new TicketDeleteMessage({
          ticket: { ...deletedTicket },
        });

        const outbox = await AppDataSource.manager.getRepository(Outbox).findOneBy({ id: MoreThan(0) });

        expect(outbox).toEqual(
          expect.objectContaining({
            eventName: TicketEventPattern.TicketDelete,
            status: OutboxStatus.Created,
          }),
        );

        const payloadObject = JSON.parse(outbox.payload);

        expect(payloadObject).toEqual(
          expect.objectContaining({
            ticket: expect.objectContaining({
              ...expectedMessage.ticket,
              createdAt: String(expectedMessage.ticket.createdAt.toJSON()),
              updatedAt: String(expectedMessage.ticket.updatedAt.toJSON()),
              deletedAt: String(expectedMessage.ticket.deletedAt.toJSON()),
            }),
            operationUuid: expect.any(String),
          }),
        );
      });
  });
});
