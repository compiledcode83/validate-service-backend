import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { AppBootstrapManager } from '@web/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { AuthService } from '@web/auth/auth.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { User } from '@app/user/user.entity';
import { UserStatus } from '@app/user/user.types';
import { AuthCode } from '@web/auth/auth-code.entity';
import { Message } from '@app/message/message.entity';
import { MessageChannel, MessageStatus, MessageType } from '@app/message/message.types';
import { AuthCodeFactory } from '@app/database/factories/auth-code.factory';
import { UserRefreshTokenFactory } from '@app/database/factories/user-refresh-token.factory';
import { UserRefreshToken } from '@web/user-refresh-token/user-refresh-token.entity';
import { UserFactory } from '@app/database/factories/user.factory';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let authService: AuthService;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();

    moduleFixture = await testingModuleBuilder.compile();

    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app as NestExpressApplication);
    testHelper = new TestHelper(moduleFixture, jest);
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

  describe('JWT access token test', () => {
    it('Checks that JWT strategy works for protected endpoints', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const method = 'createAccessToken';
      const accessToken = await authService[method](user);
      const newName = faker.name.fullName();
      const newEmail = faker.internet.email();

      await request(app.getHttpServer())
        .patch(`/api/v1/users/${user.uuid}`)
        .send({
          name: newName,
          email: newEmail,
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              name: newName,
              email: newEmail,
            }),
          );
          expect(response.status).toBe(HttpStatus.OK);
        });

      await request(app.getHttpServer())
        .patch(`/api/v1/users/${user.uuid}`)
        .send({
          name: newName,
          email: newEmail,
        })
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });

      await request(app.getHttpServer())
        .get(`/api/v1/users/${user.uuid}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              uuid: user.uuid,
            }),
          );
          expect(response.status).toBe(HttpStatus.OK);
        });
    });
  });

  describe('Send auth code', () => {
    it('Fails to send auth code because of validation errors', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/auth/send-auth-code`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: expect.arrayContaining([
                'phoneNumber must be a valid phone number',
                'ticketProviderUuid must be a UUID',
                'User-agent must be present in headers',
              ]),
            }),
          );

          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('Sends auth code for a new user successfully', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const phoneNumber = faker.phone.number('+38050#######').toString();
      const userAgent = faker.internet.userAgent();

      await request(app.getHttpServer())
        .post(`/api/v1/auth/send-auth-code`)
        .set('User-agent', userAgent)
        .send({
          phoneNumber,
          ticketProviderUuid: ticketProvider.uuid,
        })
        .set('Accept', 'application/json')
        .then(async (response) => {
          expect(response.body).toEqual(expect.objectContaining({}));
          expect(response.status).toBe(HttpStatus.CREATED);

          const user = await AppDataSource.manager.getRepository(User).findOneBy({ phoneNumber });

          expect(user).toEqual(
            expect.objectContaining({
              phoneNumber,
              name: null,
              email: null,
              ticketProviderId: ticketProvider.id,
              status: UserStatus.Creating,
            }),
          );

          const authCode = await AppDataSource.manager.getRepository(AuthCode).findOneBy({ userId: user.id });

          expect(authCode).toEqual(
            expect.objectContaining({
              phoneNumber,
              userId: user.id,
              code: expect.any(Number),
              userAgent,
              ip: expect.any(String),
            }),
          );

          const expireAt = DateTime.fromJSDate(authCode.expireAt);

          expect(expireAt.diffNow('minutes').minutes > 0).toBeTruthy();

          const message = await AppDataSource.manager.getRepository(Message).findOneBy({ userId: user.id });
          const { code } = authCode;

          expect(message).toEqual(
            expect.objectContaining({
              content: String(code),
              type: MessageType.AuthCode,
              channel: MessageChannel.SMS,
              sendTo: user.phoneNumber,
              userId: user.id,
              status: MessageStatus.Created,
            }),
          );
        });
    });

    it('Sends auth code for an existing user successfully', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const userAgent = faker.internet.userAgent();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });

      await request(app.getHttpServer())
        .post(`/api/v1/auth/send-auth-code`)
        .set('User-agent', userAgent)
        .send({
          phoneNumber: user.phoneNumber,
          ticketProviderUuid: ticketProvider.uuid,
        })
        .set('Accept', 'application/json')
        .then(async (response) => {
          expect(response.body).toEqual(expect.objectContaining({}));
          expect(response.status).toBe(HttpStatus.CREATED);

          const authCode = await AppDataSource.manager.getRepository(AuthCode).findOneBy({ userId: user.id });

          expect(authCode).toEqual(
            expect.objectContaining({
              phoneNumber: user.phoneNumber,
              userId: user.id,
              code: expect.any(Number),
              userAgent,
              ip: expect.any(String),
            }),
          );

          const expireAt = DateTime.fromJSDate(authCode.expireAt);

          expect(expireAt.diffNow('minutes').minutes > 0).toBeTruthy();

          const message = await AppDataSource.manager.getRepository(Message).findOneBy({ userId: user.id });
          const { code } = authCode;

          expect(message).toEqual(
            expect.objectContaining({
              content: String(code),
              type: MessageType.AuthCode,
              channel: MessageChannel.SMS,
              sendTo: user.phoneNumber,
              userId: user.id,
              status: MessageStatus.Created,
            }),
          );
        });
    });
  });

  describe('Verify auth code', () => {
    it('Fails to verify auth code because of validation errors', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/auth/verify-auth-code`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: expect.arrayContaining([
                'phoneNumber must be a valid phone number',
                'User not found',
                'authCode must be an integer number',
                'fingerprint must be shorter than or equal to 64 characters',
                'User-agent must be present in headers',
              ]),
            }),
          );

          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('Fails to verify auth code because the code is wrong', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });

      await request(app.getHttpServer())
        .post(`/api/v1/auth/verify-auth-code`)
        .set('Accept', 'application/json')
        .set('User-agent', 'jest')
        .send({
          phoneNumber: user.phoneNumber,
          authCode: 1,
          fingerprint: faker.random.word(),
        })
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: 'Invalid or expired code',
            }),
          );

          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('Fails to verify auth code because the code is expired', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const authCode = await AuthCodeFactory.create({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        expireAt: DateTime.now().minus({ days: 1 }).toJSDate(),
      });

      await request(app.getHttpServer())
        .post(`/api/v1/auth/verify-auth-code`)
        .set('Accept', 'application/json')
        .set('User-agent', 'jest')
        .send({
          phoneNumber: user.phoneNumber,
          authCode: authCode.code,
          fingerprint: faker.random.word(),
        })
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: 'Invalid or expired code',
            }),
          );

          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('Fails to verify auth code because the code is already used', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const authCode = await AuthCodeFactory.create({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        usedAt: DateTime.now().minus({ days: 1 }).toJSDate(),
      });

      await request(app.getHttpServer())
        .post(`/api/v1/auth/verify-auth-code`)
        .set('Accept', 'application/json')
        .set('User-agent', 'jest')
        .send({
          phoneNumber: user.phoneNumber,
          authCode: authCode.code,
          fingerprint: faker.random.word(),
        })
        .then((response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              message: 'Invalid or expired code',
            }),
          );

          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it('Verifies auth code successfully', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const authCode = await AuthCodeFactory.create({
        userId: user.id,
        phoneNumber: user.phoneNumber,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/auth/verify-auth-code`)
        .set('Accept', 'application/json')
        .set('User-agent', 'jest')
        .send({
          phoneNumber: user.phoneNumber,
          authCode: authCode.code,
          fingerprint: faker.random.word(),
        })
        .then(async (response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              tokens: {
                accessToken: expect.any(String),
              },
              user: expect.objectContaining({
                ...user,
              }),
              hasToCompleteProfile: false,
            }),
          );

          expect(response.body).not.toEqual(
            expect.objectContaining({
              tokens: {
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
              },
              user: expect.objectContaining({
                ...user,
              }),
              hasToCompleteProfile: false,
            }),
          );

          expect(response.status).toBe(HttpStatus.CREATED);

          const [cookies] = response.headers['set-cookie'];

          expect(cookies).toContain('refreshToken=');

          const authCode = await AppDataSource.manager.getRepository(AuthCode).findOneBy({ userId: user.id });

          expect(authCode).toEqual(
            expect.objectContaining({
              usedAt: expect.any(Date),
            }),
          );
        });
    });
  });

  describe('Refresh tokens', () => {
    it('Checks that refreshing tokens does not work with incorrect refresh token in cookies', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const fingerprint = faker.datatype.uuid();

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
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const fingerprint = faker.datatype.uuid();
      const refreshToken = await UserRefreshTokenFactory.create({
        userId: user.id,
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
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const fingerprint = faker.datatype.uuid();
      const refreshToken = await UserRefreshTokenFactory.create({
        userId: user.id,
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
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const fingerprint = faker.datatype.uuid();
      const refreshToken = await UserRefreshTokenFactory.create({
        userId: user.id,
        fingerprint,
      });

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
            .getRepository(UserRefreshToken)
            .findOneBy({ token: refreshToken.token });

          expect(oldRefreshToken).toBeNull();
        });
    });
  });

  describe('Logout', () => {
    it('Checks that logout works and deleted refresh token from database', async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const fingerprint = faker.datatype.uuid();
      const refreshToken = await UserRefreshTokenFactory.create({
        userId: user.id,
        fingerprint,
      });

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
            .getRepository(UserRefreshToken)
            .findOneBy({ token: refreshToken.token });

          expect(deleteRefreshToken).toBeNull();
        });
    });
  });
});
