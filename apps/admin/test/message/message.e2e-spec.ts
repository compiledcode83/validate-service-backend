import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppBootstrapManager } from '@admin/app-bootstrap.manager';
import { ListingFactory } from '@app/database/factories/listing.factory';
import { UserFactory } from '@app/database/factories/user.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { AppDataSource } from '@app/common/configs/datasource';
import { AdminFactory } from '@app/database/factories/admin.factory';
import { MessageFactory } from '@app/database/factories/message.factory';
import { TestHelper } from '@app/common/helpers/test.helper';

describe('Listing e2e', () => {
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
    request(app.getHttpServer()).get('/api/v1/messages').expect(HttpStatus.UNAUTHORIZED);
  });

  it('Should get messages by pagination', async () => {});
});
