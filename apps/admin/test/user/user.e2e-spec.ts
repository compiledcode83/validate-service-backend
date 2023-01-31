import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { UserFactory } from '@app/database/factories/user.factory';
import { AppDataSource } from '@app/common/configs/datasource';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { faker } from '@faker-js/faker';
import { UserStatus } from '@app/user/user.types';

describe('User (e2e)', () => {
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
    request(app.getHttpServer()).get('/api/v1/users').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).get('/api/v1/users/test').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).post('/api/v1/users').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).patch('/api/v1/users').expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer()).delete('/api/v1/users').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should post a user and return validation errors in response', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const userData = {
      name: null,
      email: null,
      phoneNumber: null,
      ticketProviderId: null,
    };

    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(userData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body.message).toEqual(
          expect.arrayContaining([
            'name must be shorter than or equal to 128 characters',
            'email must be shorter than or equal to 255 characters',
            'phoneNumber must be shorter than or equal to 255 characters',
            'ticketProviderId must be an integer number',
          ]),
        );
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it(`should post a user and get it back in response`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();

    const userData = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number('+38050#######').toString(),
      ticketProviderId: ticketProvider.id,
    };

    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(userData)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...userData,
            id: response.body.id,
            uuid: expect.any(String),
            status: UserStatus.Creating,
          }),
        );
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });

  it(`should get users by pagination`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);

    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });

    await request(app.getHttpServer())
      .get(`/api/v1/users?limit=1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then(async (response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ...user2,
            }),
          ]),
        );
        const afterCursor = response.body.cursor.afterCursor;

        await request(app.getHttpServer())
          .get(`/api/v1/users?limit=1&afterCursor=${afterCursor}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .then((response) => {
            expect(response.body.data).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  ...user,
                }),
              ]),
            );
          });
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('Should update a user and get updated data in response', async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();

    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const updatedUser = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      phoneNumber: '+923214757374',
    };

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.id}`)
      .send(updatedUser)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: user.id,
            ...updatedUser,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get a user by id`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();

    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });

    await request(app.getHttpServer())
      .get(`/api/v1/users/${user.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            ...user,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
