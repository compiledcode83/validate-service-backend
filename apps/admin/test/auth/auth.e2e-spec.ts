import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { AdminService } from '@admin/admin/admin.service';
import { AdminRefreshTokenFactory } from '@app/database/factories/admin-refresh-token.factory';
import { AdminRefreshToken } from '@admin/admin-refresh-token/admin-refresh-token.entity';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { TestHelper } from '@app/common/helpers/test.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let adminService: AdminService;

  beforeAll(async () => {
    moduleFixture = await AppBootstrapManager.getTestingModule();
    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app);
    testHelper = new TestHelper(moduleFixture, jest);
    adminService = moduleFixture.get(AdminService);

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

  it('Should return error for login with wrong email and password', async () => {
    const admin = await AdminFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await adminService.setPassword(admin.email, password);

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('User-agent', faker.internet.userAgent())
      .send({
        email: admin.email,
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
    const admin = await AdminFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await adminService.setPassword(admin.email, password);

    await request(app.getHttpServer())
      .post(`/api/v1/auth/login`)
      .set('User-agent', faker.internet.userAgent())
      .send({
        email: admin.email,
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
    const admin = await AdminFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await adminService.setPassword(admin.email, password);

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
    const admin = await AdminFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await adminService.setPassword(admin.email, password);
    const refreshToken = await AdminRefreshTokenFactory.create({
      adminId: admin.id,
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
    const admin = await AdminFactory.create();
    const password = faker.random.alphaNumeric(12);
    const fingerprint = faker.datatype.uuid();
    await adminService.setPassword(admin.email, password);
    const refreshToken = await AdminRefreshTokenFactory.create({
      adminId: admin.id,
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
    const admin = await AdminFactory.create();
    const fingerprint = faker.datatype.uuid();
    const refreshToken = await AdminRefreshTokenFactory.create({
      adminId: admin.id,
      fingerprint,
    });
    const password = faker.random.alphaNumeric(12);
    await adminService.setPassword(admin.email, password);

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
          .getRepository(AdminRefreshToken)
          .findOneBy({ token: refreshToken.token });

        expect(oldRefreshToken).toBeNull();
      });
  });

  it('Checks that logout works and deleted refresh token from database', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const fingerprint = faker.datatype.uuid();
    const refreshToken = await AdminRefreshTokenFactory.create({
      adminId: ticketProvider.id,
      fingerprint,
    });
    const password = faker.random.alphaNumeric(12);
    await adminService.setPassword(ticketProvider.email, password);

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
          .getRepository(AdminRefreshToken)
          .findOneBy({ token: refreshToken.token });

        expect(deleteRefreshToken).toBeNull();
      });
  });
});
