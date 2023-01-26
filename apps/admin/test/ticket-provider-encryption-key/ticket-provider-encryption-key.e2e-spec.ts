import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TestHelper } from '@app/common/helpers/test.helper';
import { TicketProviderEncryptionKeyFactory } from '@app/database/factories/ticket-provider-encryption-key.factory';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { SECRET_KEY_LENGTH } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.types';

describe('Ticket-provider-encryption-keys (e2e)', () => {
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

  it('checks that endpoints are protected', () => {
    request(app.getHttpServer())
      .get('/api/v1/ticket-provider-encryption-keys/1/1')
      .expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer())
      .get('/api/v1/ticket-provider-encryption-keys')
      .expect(HttpStatus.UNAUTHORIZED);
    request(app.getHttpServer())
      .post('/api/v1/ticket-provider-encryption-keys')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should successfully create a new encryption key`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();

    await request(app.getHttpServer())
      .post('/api/v1/ticket-provider-encryption-keys')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ ticketProviderId: ticketProvider.id })
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            version: 1,
            createdAt: expect.any(String),
            secretKey: expect.any(String),
          }),
        );
        expect(response.body.secretKey.length).toEqual(SECRET_KEY_LENGTH);
        expect(response.status).toBe(HttpStatus.CREATED);
      });
  });

  it(`should not get encryption key by version, because it belongs to another ticket provider`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const ticketProviderSecond = await TicketProviderFactory.create();
    const encryptionKey = await TicketProviderEncryptionKeyFactory.create({
      ticketProviderId: ticketProviderSecond.id,
      version: 1,
    });

    await request(app.getHttpServer())
      .get(
        `/api/v1/ticket-provider-encryption-keys/${encryptionKey.version}/${ticketProvider.id}`,
      )
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send({ ticketProviderId: ticketProvider.id })
      .then((response) => {
        expect(response.body.message).toEqual('Encryption key not found');
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
  });

  it(`should get encryption key by version successfully`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const encryptionKey = await TicketProviderEncryptionKeyFactory.create({
      ticketProviderId: ticketProvider.id,
      version: 5,
    });

    await request(app.getHttpServer())
      .get(
        `/api/v1/ticket-provider-encryption-keys/${encryptionKey.version}/${ticketProvider.id}`,
      )
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            version: encryptionKey.version,
            secretKey: encryptionKey.secretKey,
            createdAt: expect.any(String),
          }),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get paginated encryption keys successfully`, async () => {
    const admin = await AdminFactory.create();
    const token = testHelper.setAuthenticatedAdmin(admin);
    const ticketProvider = await TicketProviderFactory.create();
    const encryptionKey = await TicketProviderEncryptionKeyFactory.create({
      ticketProviderId: ticketProvider.id,
      version: 5,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/ticket-provider-encryption-keys?limit=1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              version: encryptionKey.version,
              secretKey: encryptionKey.secretKey,
              createdAt: expect.any(String),
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
