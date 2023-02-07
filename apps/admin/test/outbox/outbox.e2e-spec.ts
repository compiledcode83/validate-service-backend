import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { AppDataSource } from '@app/common/configs/datasource';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { OutboxFactory } from '@app/database/factories/outbox.factory';
import { faker } from '@faker-js/faker';

describe('Outbox e2e', () => {
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
    request(app.getHttpServer()).get('/api/v1/outbox').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should get outbox by pagination', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const event2 = await EventFactory.create({ ticketProviderId: ticketProvider.id });

    const outbox = await OutboxFactory.create({ eventName: event.name, payload: faker.random.word() });
    const outbox2 = await OutboxFactory.create({ eventName: event2.name, payload: faker.random.word() });

    await request(app.getHttpServer())
      .get(`/api/v1/outbox?limit=1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: outbox2.id,
            }),
          ]),
        );

        const afterCursor = response.body.cursor.afterCursor;

        await request(app.getHttpServer())
          .get(`/api/v1/outbox?limit=1&afterCursor=${afterCursor}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .then((response) => {
            expect(response.body.data).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: outbox.id,
                }),
              ]),
            );
          });
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
