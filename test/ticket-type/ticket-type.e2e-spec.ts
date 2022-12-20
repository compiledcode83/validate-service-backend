import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@src/app-bootstrap.manager';
import { AppDataSource } from '@src/config/datasource';
import { TicketProviderFactory } from '@src/database/factories/ticket-provider.factory';
import { TestHelper } from '@test/helpers/test.helper';
import { faker } from '@faker-js/faker';
import { TicketProviderUserIdentifier } from '@src/ticket-provider/ticket-provider.types';
import { TicketTypeFactory } from '@src/database/factories/ticket-type.factory';
import { EventFactory } from '@src/database/factories/event.factory';
import { DateTime } from 'luxon';
import { DATE_FORMAT } from '@src/ticket-type/ticket-type.types';

describe('Ticket-types (e2e)', () => {
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
    request(app.getHttpServer()).get('/api/v1/ticket-types/1').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).post('/api/v1/ticket-types').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).patch('/api/v1/ticket-types').expect(HttpStatus.UNAUTHORIZED);
  });

  it('should post a new ticket type and get validation errors', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);

    await request(app.getHttpServer())
      .post('/api/v1/ticket-types')
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'eventUuid must be a UUID',
            'Event not found',
            'name must be shorter than or equal to 255 characters',
            'Ticket type with this name already exists',
            'Acceptable date format is yyyy-MM-dd.',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('should check that conditional validation for sale and resale properties works', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });

    await request(app.getHttpServer())
      .post('/api/v1/ticket-types')
      .send({
        name: faker.random.word(),
        eventUuid: event.uuid,
        saleEnabled: 1,
        resaleEnabled: 1,
        ticketDateStart: DateTime.now().toFormat(DATE_FORMAT),
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'saleEnabledFromDate must be a valid ISO 8601 date string',
            'saleEnabledToDate must be a valid ISO 8601 date string',
            'saleAmount must not be greater than 1000000',
            'resaleEnabledFromDate must be a valid ISO 8601 date string',
            'resaleEnabledToDate must be a valid ISO 8601 date string',
            'resaleMinPrice must not be less than 0.01',
            'resaleMaxPrice must not be less than 0.02',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('should check for ticket type duplicates when creating a new item', async () => {
    const ticketProvider = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });

    await request(app.getHttpServer())
      .post('/api/v1/ticket-types')
      .send({
        eventUuid: event.uuid,
        name: ticketType.name,
        ticketDateStart: DateTime.now().toFormat(DATE_FORMAT),
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining([`Ticket type with this name already exists`]));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });

    await request(app.getHttpServer())
      .post('/api/v1/ticket-types')
      .send({
        eventUuid: event2.uuid,
        name: ticketType.name,
        ticketDateStart: DateTime.now().toFormat(DATE_FORMAT),
        saleEnabled: 1,
        saleEnabledFromDate: DateTime.now().toISO(),
        saleEnabledToDate: DateTime.now().toISO(),
        saleAmount: 1000,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });

  it('should check for ticket type duplicates when updating an existing item', async () => {
    const ticketProvider = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });
    const ticketType2 = await TicketTypeFactory.create({ eventId: event.id });

    await request(app.getHttpServer())
      .patch(`/api/v1/ticket-types/${ticketType.uuid}`)
      .send({
        name: ticketType2.name,
        ticketDateStart: DateTime.now().toFormat(DATE_FORMAT),
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining([`Ticket type with this name already exists`]));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });

    const newName = faker.commerce.department();

    await request(app.getHttpServer())
      .patch(`/api/v1/ticket-types/${ticketType.uuid}`)
      .send({
        name: newName,
        ticketDateStart: DateTime.now().toFormat(DATE_FORMAT),
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body).toEqual(expect.objectContaining({ name: newName }));
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('should get a paginated list of all ticket types for a specific event', async () => {
    const ticketProvider = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const ticketProvider2 = await TicketProviderFactory.create({ userIdentifier: TicketProviderUserIdentifier.Email });
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event3 = await EventFactory.create({ ticketProviderId: ticketProvider2.id });
    const ticketType = await TicketTypeFactory.create({ eventId: event.id });
    const ticketType2 = await TicketTypeFactory.create({ eventId: event.id });
    const ticketType3 = await TicketTypeFactory.create({ eventId: event2.id });
    const ticketType4 = await TicketTypeFactory.create({ eventId: event3.id });

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-types`)
      .query({
        eventUuid: event3.uuid,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-types`)
      .query({
        eventUuid: event.uuid,
      })
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticketType.uuid,
            }),
            expect.objectContaining({
              uuid: ticketType2.uuid,
            }),
            expect.not.objectContaining({
              uuid: ticketType3.uuid,
            }),
            expect.not.objectContaining({
              uuid: ticketType4.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
