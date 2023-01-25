import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { TestHelper } from '@app/common/helpers/test.helper';

describe('Ticket Provider (e2e)', () => {
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
    request(app.getHttpServer()).get('/api/v1/ticket-providers').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer())
      .get('/api/v1/ticket-providers/test')
      .expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer())
      .post('/api/v1/ticket-providers')
      .expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer())
      .patch('/api/v1/ticket-providers')
      .expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer())
      .delete('/api/v1/ticket-providers')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should post a ticket provider and return validation errors in response', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProviderData = {
      name: null,
      email: null,
    };
    await request(app.getHttpServer())
      .post('/api/v1/ticket-providers')
      .send(ticketProviderData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'name must be shorter than or equal to 128 characters',
            'email must be shorter than or equal to 255 characters',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`should post a ticket provider and get it back in response`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProviderData = {
      name: 'Test Ticket Provider',
      email: 'test@test.com',
      securityLevel: 2,
    };

    await request(app.getHttpServer())
      .post('/api/v1/ticket-providers')
      .send(ticketProviderData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...ticketProviderData,
            id: response.body.id,
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });

  it(`should get ticket provider by pagination`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const ticketProvider2 = await TicketProviderFactory.create();

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-providers?limit=1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ...ticketProvider2,
            }),
          ]),
        );
        const afterCursor = response.body.cursor.afterCursor;
        await request(app.getHttpServer())
          .get(`/api/v1/ticket-providers?limit=1&afterCursor=${afterCursor}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .then((response) => {
            expect(response.body.data).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  ...ticketProvider,
                }),
              ]),
            );
          });
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('Should update a ticket provider and get updated data in response', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const updatedTicketProvider = {
      name: 'Test Ticket Provider',
      email: 'test@test.com',
      securityLevel: ticketProvider.securityLevel === 2 ? 1 : 2,
    };

    await request(app.getHttpServer())
      .patch(`/api/v1/ticket-providers/${ticketProvider.id}`)
      .send(updatedTicketProvider)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: ticketProvider.id,
            ...updatedTicketProvider,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get a ticket provider by id`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-providers/${ticketProvider.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...ticketProvider,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
