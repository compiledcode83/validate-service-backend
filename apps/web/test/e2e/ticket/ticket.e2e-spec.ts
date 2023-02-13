import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AppBootstrapManager } from '@web/app-bootstrap.manager';
import { UserFactory } from '@app/database/factories/user.factory';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { TicketStatus } from '@app/ticket/ticket.types';
import { TestHelper } from '@app/common/helpers/test.helper';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { RedeemFactory } from '@app/database/factories/redeem.factory';
import { RedeemMode, RedeemStatus } from '@app/redeem/redeem.types';
import { RedeemTicketFactory } from '@app/database/factories/redeem-ticket.factory';

describe('Ticket (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
    moduleFixture = await testingModuleBuilder.compile();

    app = moduleFixture.createNestApplication();
    AppBootstrapManager.setAppDefaults(app as NestExpressApplication);
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

  it(`should respond with 404 if ticket(s) is not found`, async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/tickets/hash`)
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.message).toEqual('Ticket not found');
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });
  });

  it(`should get a list of tickets by purchase id`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const purchaseId = uuid();
    const ticketType = await TicketTypeFactory.create({
      eventId: event.id,
    });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
      purchaseId,
    });
    const ticket2 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });
    const ticket3 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user2.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });
    const ticket4 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user2.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
      purchaseId,
    });

    await request(app.getHttpServer())
      .get(`/api/v1/tickets/${purchaseId}`)
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticket.uuid,
              redeems: [],
              ticketType: expect.objectContaining({
                name: ticketType.name,
                event: expect.objectContaining({
                  name: event.name,
                }),
              }),
            }),
            expect.objectContaining({
              uuid: ticket4.uuid,
              redeems: [],
              ticketType: expect.objectContaining({
                name: ticketType.name,
                event: expect.objectContaining({
                  name: event.name,
                }),
              }),
            }),
            expect.not.objectContaining({
              uuid: ticket2.uuid,
            }),
            expect.not.objectContaining({
              uuid: ticket3.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });

  it(`should get a list of tickets by purchase id and active redeem info`, async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const user2 = await UserFactory.create({ ticketProviderId: ticketProvider.id });
    const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
    const purchaseId = uuid();
    const ticketType = await TicketTypeFactory.create({
      eventId: event.id,
    });
    const ticket = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
      purchaseId,
    });
    const ticket2 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });
    const ticket3 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user2.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
    });
    const ticket4 = await TicketFactory.create({
      ticketProviderId: ticketProvider.id,
      userId: user2.id,
      status: TicketStatus.Active,
      ticketTypeId: ticketType.id,
      eventId: event.id,
      purchaseId,
    });
    const redeem = await RedeemFactory.create({
      purchaseId: ticket.purchaseId,
      userId: user.id,
      status: RedeemStatus.NotRedeemed,
      mode: RedeemMode.Individual,
    });

    await Promise.all([
      RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket.id }),
      RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket2.id }),
      RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket3.id }),
      RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket4.id }),
    ]);

    await request(app.getHttpServer())
      .get(`/api/v1/tickets/${purchaseId}`)
      .set('Accept', 'application/json')
      .then((response) => {
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              uuid: ticket.uuid,
              redeems: expect.arrayContaining([
                expect.objectContaining({
                  uuid: redeem.uuid,
                  mode: redeem.mode,
                }),
              ]),
              ticketType: expect.objectContaining({
                name: ticketType.name,
                event: expect.objectContaining({
                  name: event.name,
                }),
              }),
            }),
            expect.objectContaining({
              uuid: ticket4.uuid,
              redeems: expect.arrayContaining([
                expect.objectContaining({
                  uuid: redeem.uuid,
                  mode: redeem.mode,
                }),
              ]),
              ticketType: expect.objectContaining({
                name: ticketType.name,
                event: expect.objectContaining({
                  name: event.name,
                }),
              }),
            }),
            expect.not.objectContaining({
              uuid: ticket2.uuid,
            }),
            expect.not.objectContaining({
              uuid: ticket3.uuid,
            }),
          ]),
        );
        expect(response.status).toBe(HttpStatus.OK);
      });
  });
});
