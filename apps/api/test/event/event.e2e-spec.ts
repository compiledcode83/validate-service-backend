import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@api/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { faker } from '@faker-js/faker';
import { EventFactory } from '@app/database/factories/event.factory';
import { DateTime } from 'luxon';
import { EventCreateMessage } from '@app/event/messages/event-create.message';
import { MoreThan } from 'typeorm';
import { TicketProviderUserIdentifier } from '@app/ticket-provider/ticket-provider.types';
import { DATE_FORMAT } from '@app/ticket-type/ticket-type.types';
import { OutboxStatus } from '@app/outbox/outbox.types';
import { Outbox } from '@app/outbox/outbox.entity';
import { Event } from '@app/event/event.entity';
import { EventEventPattern } from '@app/event/event.types';

describe('Events (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
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
    jest.resetAllMocks();
  });

  it('checks that endpoints are protected', () => {
    request(app.getHttpServer()).get('/api/v1/events/1').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).post('/api/v1/events').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).patch('/api/v1/events').expect(HttpStatus.UNAUTHORIZED);
  });

  it('should post a new event and get validation errors', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining(['name must be longer than or equal to 1 characters']),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('should check for event duplicates when creating a new item', async () => {
    const ticketProvider = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .send({
        name: event.name,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining([`Event with this name already exists`]));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });

    await request(app.getHttpServer())
      .post('/api/v1/events')
      .send({
        name: faker.random.word(),
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.CREATED);

        const newEvent = await AppDataSource.manager
          .getRepository(Event)
          .findOne({ where: { uuid: response.body.uuid } });

        const expectedEventCreateMessage = new EventCreateMessage({
          event: newEvent,
        });

        const outbox = await AppDataSource.manager.getRepository(Outbox).findOneBy({ id: MoreThan(0) });

        expect(outbox).toEqual(
          expect.objectContaining({
            eventName: EventEventPattern.Create,
            status: OutboxStatus.Created,
          }),
        );

        const payloadObject = JSON.parse(outbox.payload);

        expect(payloadObject).toEqual(
          expect.objectContaining({
            event: expect.objectContaining({
              ...expectedEventCreateMessage.event,
              createdAt: String(newEvent.createdAt.toJSON()),
            }),
            operationUuid: expect.any(String),
          }),
        );
      });
  });

  it('should check for event duplicates when updating an existing item', async () => {
    const ticketProvider = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });

    await request(app.getHttpServer())
      .patch(`/api/v1/events/${event.uuid}`)
      .send({
        name: event2.name,
        ticketDateStart: DateTime.now().toFormat(DATE_FORMAT),
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining([`Event with this name already exists`]));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });

    const newName = faker.commerce.department();

    await request(app.getHttpServer())
      .patch(`/api/v1/events/${event.uuid}`)
      .send({
        name: newName,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.body).toEqual(expect.objectContaining({ name: newName }));
        expect(response.status).toBe(HttpStatus.OK);

        const updatedEvent = await AppDataSource.manager.getRepository(Event).findOne({ where: { uuid: event.uuid } });
        const expectedEventUpdateMessage = new EventCreateMessage({
          event: updatedEvent,
        });

        const outbox = await AppDataSource.manager.getRepository(Outbox).findOneBy({ id: MoreThan(0) });

        expect(outbox).toEqual(
          expect.objectContaining({
            eventName: EventEventPattern.Update,
            status: OutboxStatus.Created,
          }),
        );

        const payloadObject = JSON.parse(outbox.payload);

        expect(payloadObject).toEqual(
          expect.objectContaining({
            event: expect.objectContaining({
              ...expectedEventUpdateMessage.event,
              createdAt: String(updatedEvent.createdAt.toJSON()),
              updatedAt: String(updatedEvent.updatedAt.toJSON()),
            }),
            operationUuid: expect.any(String),
          }),
        );
      });
  });

  it('should get a paginated list of all events for a specific ticket provider', async () => {
    const ticketProvider = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const ticketProvider2 = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event3 = await EventFactory.create({ ticketProviderId: ticketProvider2.id });

    await request(app.getHttpServer())
      .get(`/api/v1/events`)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: event.uuid,
            }),
            expect.objectContaining({
              uuid: event2.uuid,
            }),
            expect.not.objectContaining({
              uuid: event3.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
