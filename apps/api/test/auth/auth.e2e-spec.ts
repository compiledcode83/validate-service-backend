import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { AppBootstrapManager } from '@api/app-bootstrap.manager';
import { AppDataSource } from '@app/database/config/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TestHelper } from '@test/helpers/test.helper';
import { TicketProviderRefreshTokenFactory } from '@app/database/factories/ticket-provider-refresh-token.factory';
import { TicketProviderService } from '@api/ticket-provider/ticket-provider.service';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { AuthService } from '@api/auth/auth.service';
import { TicketProviderRefreshToken } from '@api/ticket-provider-refresh-token/ticket-provider-refresh-token.entity';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let ticketProviderService: TicketProviderService;
  let authService: AuthService;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();

    moduleFixture = await testingModuleBuilder.compile();

    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app);
    testHelper = new TestHelper(moduleFixture, jest);
    ticketProviderService = moduleFixture.get(TicketProviderService);
    authService = moduleFixture.get(AuthService);

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

  it('Checks that endpoints are protected by default', async () => {
    await request(app.getHttpServer()).get('/api/v1/tickets/1').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Checks that Api-Key strategy works for protected endpoints', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const token = await testHelper.createTicketProviderToken(ticketProvider.id);
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });

    await request(app.getHttpServer())
      .get(`/api/v1/tickets/${ticket.uuid}`)
      .set('Accept', 'application/json')
      .set('Api-Key', token)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: ticket.uuid,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('Checks that JWT strategy works for protected endpoints', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const ticket = await TicketFactory.create({ ticketProviderId: ticketProvider.id, userId: user.id });
    const method = 'createAccessToken';
    const accessToken = await authService[method](ticketProvider);

    await request(app.getHttpServer())
      .get(`/api/v1/tickets/${ticket.uuid}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            uuid: ticket.uuid,
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it('Checks that login with wrong email and password returns and error', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await ticketProviderService.setPassword(ticketProvider.email, password);

    await request(app.getHttpServer())
      .post(`/api/v1/auth/login`)
      .set('User-agent', faker.internet.userAgent())
      .send({
        email: ticketProvider.email,
        password: password + faker.random.word(),
        fingerprint,
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Incorrect username or password',
          }),
        );

        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });
  });

  it('Checks that login with correct email and password returns access token', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await ticketProviderService.setPassword(ticketProvider.email, password);

    await request(app.getHttpServer())
      .post(`/api/v1/auth/login`)
      .set('User-agent', faker.internet.userAgent())
      .send({
        email: ticketProvider.email,
        password,
        fingerprint,
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String),
          }),
        );

        expect(response.status).toBe(HttpStatus.CREATED);

        const [cookies] = response.headers['set-cookie'];

        expect(cookies).toContain('refreshToken=');
      });
  });

  it('Checks that refreshing tokens does not work with incorrect refresh token in cookies', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await ticketProviderService.setPassword(ticketProvider.email, password);

    await request(app.getHttpServer())
      .post(`/api/v1/auth/refresh-tokens`)
      .set('User-agent', faker.internet.userAgent())
      .set('Cookie', [`refreshToken=${faker.random.alphaNumeric(64)}`])
      .send({
        fingerprint,
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Refresh token not found or expired']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('Checks that refreshing tokens does not work with expired refresh token in cookies', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await ticketProviderService.setPassword(ticketProvider.email, password);
    const refreshToken = await TicketProviderRefreshTokenFactory.create({
      ticketProviderId: ticketProvider.id,
      fingerprint,
      expireAt: DateTime.now().minus({ days: 1 }).toJSDate(),
    });

    await request(app.getHttpServer())
      .post(`/api/v1/auth/refresh-tokens`)
      .set('User-agent', faker.internet.userAgent())
      .set('Cookie', [`refreshToken=${refreshToken.token}`])
      .send({
        fingerprint,
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Refresh token not found or expired']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('Checks that refreshing tokens does not work with invalid fingerprint', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await ticketProviderService.setPassword(ticketProvider.email, password);
    const refreshToken = await TicketProviderRefreshTokenFactory.create({
      ticketProviderId: ticketProvider.id,
      fingerprint,
      expireAt: DateTime.now().minus({ days: 1 }).toJSDate(),
    });

    await request(app.getHttpServer())
      .post(`/api/v1/auth/refresh-tokens`)
      .set('User-agent', faker.internet.userAgent())
      .set('Cookie', [`refreshToken=${refreshToken.token}`])
      .send({
        fingerprint: fingerprint + faker.random.word(),
      })
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.message).toEqual(expect.arrayContaining(['Refresh token not found or expired']));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      });
  });

  it('Checks that refreshing tokens works with correct refresh token in cookies', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const fingerprint = faker.datatype.uuid();
    const refreshToken = await TicketProviderRefreshTokenFactory.create({
      ticketProviderId: ticketProvider.id,
      fingerprint,
    });
    const password = faker.random.alphaNumeric(12);
    await ticketProviderService.setPassword(ticketProvider.email, password);

    await request(app.getHttpServer())
      .post(`/api/v1/auth/refresh-tokens`)
      .set('User-agent', faker.internet.userAgent())
      .set('Cookie', [`refreshToken=${refreshToken.token}`])
      .send({
        fingerprint,
      })
      .set('Accept', 'application/json')
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            accessToken: expect.any(String),
          }),
        );

        expect(response.status).toBe(HttpStatus.CREATED);

        const [cookies] = response.headers['set-cookie'];

        expect(cookies).toContain('refreshToken=');

        const oldRefreshToken = await AppDataSource.manager
          .getRepository(TicketProviderRefreshToken)
          .findOneBy({ token: refreshToken.token });

        expect(oldRefreshToken).toBeNull();
      });
  });

  it('Checks that logout works and deleted refresh token from database', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const fingerprint = faker.datatype.uuid();
    const refreshToken = await TicketProviderRefreshTokenFactory.create({
      ticketProviderId: ticketProvider.id,
      fingerprint,
    });
    const password = faker.random.alphaNumeric(12);
    await ticketProviderService.setPassword(ticketProvider.email, password);

    await request(app.getHttpServer())
      .post(`/api/v1/auth/logout`)
      .set('User-agent', faker.internet.userAgent())
      .set('Cookie', [`refreshToken=${refreshToken.token}`])
      .send({
        fingerprint,
      })
      .set('Accept', 'application/json')
      .then(async (response) => {
        expect(response.status).toBe(HttpStatus.OK);

        const deleteRefreshToken = await AppDataSource.manager
          .getRepository(TicketProviderRefreshToken)
          .findOneBy({ token: refreshToken.token });

        expect(deleteRefreshToken).toBeNull();
      });
  });
});
