import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { DateTime } from 'luxon';
import { MoreThan } from 'typeorm';
import { AppBootstrapManager } from '@web/app-bootstrap.manager';
import { UserFactory } from '@app/database/factories/user.factory';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TicketFactory } from '@app/database/factories/ticket.factory';
import { TicketStatus } from '@app/ticket/ticket.types';
import { TestHelper } from '@app/common/helpers/test.helper';
import { NestExpressApplication } from '@nestjs/platform-express';
import { QrService } from '@web/redeem/qr.service';
import { MessageFactory } from '@app/database/factories/message.factory';
import { MessageEventPattern, MessageType } from '@app/message/message.types';
import { ListingFactory } from '@app/database/factories/listing.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { DATE_FORMAT, TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { RedisService } from '@app/redis/redis.service';
import { RedeemMode, RedeemStatus } from '@app/redeem/redeem.types';
import { RedeemFactory } from '@app/database/factories/redeem.factory';
import { Redeem } from '@app/redeem/redeem.entity';
import { RedeemTicket } from '@app/redeem/redeem-ticket.entity';
import { OutboxStatus } from '@app/outbox/outbox.types';
import { Outbox } from '@app/outbox/outbox.entity';
import { Message } from '@app/message/message.entity';
import { MessageSendMessage } from '@app/message/messages/message-send.message';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { RedeemTicketFactory } from '@app/database/factories/redeem-ticket.factory';

describe('Redeem (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let testHelper: TestHelper;
  let redisService: RedisService;
  let qrService: QrService;

  beforeAll(async () => {
    const testingModuleBuilder = AppBootstrapManager.getTestingModuleBuilder();
    moduleFixture = await testingModuleBuilder.compile();
    redisService = moduleFixture.get<RedisService>(RedisService);
    qrService = moduleFixture.get<QrService>(QrService);

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

  describe('Redeem create', () => {
    it(`should respond with validation error if purchase with specified id was not found`, async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/redeem`)
        .set('Accept', 'application/json')
        .send({
          purchaseId: 'invalid',
        })
        .then((response) => {
          expect(response.body.message).toEqual([
            `Purchase doesn't have redeemable tickets`,
            `mode must be a valid enum value`,
          ]);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should respond with validation error if ticket with specified uuid is already on sale`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });
      await ListingFactory.create({ ticketId: 1, userId: user.id, marketType: 'secondary' });

      await request(app.getHttpServer())
        .post('/api/v1/redeem')
        .set('Accept', 'application/json')
        .send({
          purchaseId: ticket.purchaseId,
          mode: RedeemMode.Individual,
        })
        .then((response) => {
          expect(response.body.message).toEqual([`Purchase doesn't have redeemable tickets`]);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should not allow to create a new redeem if there's an active redeem of same mode`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });
      await RedeemFactory.create({
        purchaseId: ticket.purchaseId,
        userId: user.id,
        mode: RedeemMode.Individual,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/redeem`)
        .set('Accept', 'application/json')
        .send({
          purchaseId: ticket.purchaseId,
          mode: RedeemMode.Individual,
        })
        .then((response) => {
          expect(response.body.message).toEqual([
            `Purchase is already being redeemed in ${RedeemMode.Individual} mode`,
          ]);
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should create a new redeem`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/redeem`)
        .set('Accept', 'application/json')
        .send({
          purchaseId: ticket.purchaseId,
          mode: RedeemMode.Individual,
        })
        .then(async (response) => {
          expect(response.body).toEqual(
            expect.objectContaining({
              uuid: expect.any(String),
              status: RedeemStatus.NotRedeemed,
            }),
          );

          expect(response.status).toBe(HttpStatus.OK);

          const createdAt = DateTime.fromISO(response.body.createdAt);
          const expireAt = DateTime.fromISO(response.body.expireAt);
          const diffInMinutes = expireAt.diff(createdAt, ['minutes']).toObject().minutes;

          expect(Math.floor(diffInMinutes)).toEqual(Number(process.env.REDEEM_CODE_EXPIRE_MINUTES));
          expect(response.body).not.toHaveProperty('ticket');
          expect(response.body).not.toHaveProperty('user');

          const createdRedeem = await AppDataSource.manager
            .getRepository(Redeem)
            .findOne({ where: { id: MoreThan(0) } });

          const redeemTickets = await AppDataSource.manager
            .getRepository(RedeemTicket)
            .find({ where: { id: MoreThan(0) } });

          expect(redeemTickets).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                ticketId: ticket.id,
                redeemId: createdRedeem.id,
              }),
            ]),
          );

          const outbox = await AppDataSource.manager.getRepository(Outbox).findOneBy({ id: MoreThan(0) });

          expect(outbox).toEqual(
            expect.objectContaining({
              eventName: MessageEventPattern.Send,
              status: OutboxStatus.Created,
            }),
          );

          const message = await AppDataSource.manager.getRepository(Message).findOne({ where: { id: MoreThan(0) } });

          expect(message).toEqual(
            expect.objectContaining({
              type: MessageType.RedeemCode,
              redeemId: expect.any(Number),
              purchaseId: ticket.purchaseId,
            }),
          );

          const expectedPayload = new MessageSendMessage({
            messageUuid: message.uuid,
            type: message.type,
            channel: message.channel,
            content: `Your redeem code is ${message.content}`,
            sendTo: user.phoneNumber,
          });

          const payloadObject = JSON.parse(outbox.payload);

          expect(payloadObject).toEqual(
            expect.objectContaining({
              ...expectedPayload,
              operationUuid: expect.any(String),
            }),
          );
        });
    });
  });

  describe('Redeem verify', () => {
    it(`should respond with validation error if redeem was already redeemed`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });
      const redeem = await RedeemFactory.create({
        purchaseId: ticket.purchaseId,
        userId: user.id,
        status: RedeemStatus.Redeemed,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        redeemId: redeem.id,
        sendTo: user.phoneNumber,
        purchaseId: ticket.purchaseId,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/redeem/${redeem.uuid}/verify`)
        .set('Accept', 'application/json')
        .send({
          code: message.content,
        })
        .then((response) => {
          expect(response.body.message).toEqual(
            expect.arrayContaining(['The redeem code is not valid or redeem is already verified']),
          );
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should respond with validation error if redeem has expired`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });
      const redeem = await RedeemFactory.create({
        userId: user.id,
        status: RedeemStatus.NotRedeemed,
        expireAt: DateTime.now().minus({ minutes: 30 }).toJSDate(),
        mode: RedeemMode.Individual,
        purchaseId: ticket.purchaseId,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        redeemId: redeem.id,
        sendTo: user.phoneNumber,
        purchaseId: ticket.purchaseId,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/redeem/${redeem.uuid}/verify`)
        .set('Accept', 'application/json')
        .send({
          code: message.content,
        })
        .then((response) => {
          expect(response.body.message).toEqual(
            expect.arrayContaining(['The redeem code is not valid or redeem is already verified']),
          );
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should respond with validation error if redeem code is invalid`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });
      const redeem = await RedeemFactory.create({
        userId: user.id,
        status: RedeemStatus.NotRedeemed,
        purchaseId: ticket.purchaseId,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        redeemId: redeem.id,
        sendTo: user.phoneNumber,
        purchaseId: ticket.purchaseId,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/redeem/${redeem.uuid}/verify`)
        .set('Accept', 'application/json')
        .send({
          code: 'bad code',
        })
        .then((response) => {
          expect(response.body.message).toEqual(
            expect.arrayContaining(['The redeem code is not valid or redeem is already verified']),
          );
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should verify the redeem code successfully`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });
      const redeem = await RedeemFactory.create({
        userId: user.id,
        status: RedeemStatus.NotRedeemed,
        purchaseId: ticket.purchaseId,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        redeemId: redeem.id,
        sendTo: user.phoneNumber,
        purchaseId: ticket.purchaseId,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/redeem/${redeem.uuid}/verify`)
        .set('Accept', 'application/json')
        .send({
          code: message.content,
        })
        .then(async (response) => {
          expect(response.status).toBe(HttpStatus.OK);
          expect(response.body).toEqual(
            expect.objectContaining({
              uuid: redeem.uuid,
              status: RedeemStatus.Redeemed,
            }),
          );

          expect(response.body).not.toHaveProperty('ticket');
          expect(response.body).not.toHaveProperty('user');

          const redisQrHash = await redisService.get(qrService.getRedeemDisplayKey(response.body.uuid));

          expect(redisQrHash).toEqual(qrService.getRedeemDisplayKey(response.body.uuid));
        });
    });
  });

  describe('Redeem QR', () => {
    it(`should respond with validation error if there's no QR display token`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({ eventId: event.id });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const ticket = await TicketFactory.create({
        ticketProviderId: ticketProvider.id,
        userId: user.id,
        status: TicketStatus.Active,
        ticketTypeId: ticketType.id,
        eventId: event.id,
      });
      const redeem = await RedeemFactory.create({
        purchaseId: ticket.purchaseId,
        userId: user.id,
        status: RedeemStatus.NotRedeemed,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        redeemId: redeem.id,
        sendTo: user.phoneNumber,
        purchaseId: ticket.purchaseId,
      });

      await request(app.getHttpServer())
        .post(`/api/v1/redeem/${redeem.uuid}/qr`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body.message).toEqual(expect.arrayContaining(['The redeem is not active or has expired']));
          expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    it(`should respond with qr code data successfully for 'individual' redeem mode`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '125.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const purchaseId = uuid();
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
        status: TicketStatus.Validated,
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
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        redeemId: redeem.id,
        sendTo: user.phoneNumber,
        purchaseId: ticket.purchaseId,
      });

      await RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket.id });
      await RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket2.id });
      await qrService.generateDisplayToken(redeem.uuid);

      await request(app.getHttpServer())
        .post(`/api/v1/redeem/${redeem.uuid}/qr`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                qrHash: expect.any(String),
                qrDisplayTtl: expect.any(Number),
                qrHashTtl: expect.any(Number),
                tickets: expect.arrayContaining([
                  expect.objectContaining({
                    uuid: ticket.uuid,
                    hash: ticket.hash,
                    imageUrl: ticket.imageUrl,
                    status: ticket.status,
                    purchaseId: ticket.purchaseId,
                    ticketType: expect.objectContaining({
                      uuid: ticketType.uuid,
                      name: ticketType.name,
                      description: ticketType.description,
                      ticketDateStart: ticketType.ticketDateStart,
                      ticketDateEnd: ticketType.ticketDateEnd,
                      event: expect.objectContaining({
                        uuid: event.uuid,
                        name: event.name,
                        shortDescription: event.shortDescription,
                        longDescription: event.longDescription,
                      }),
                    }),
                  }),
                ]),
              }),
              expect.objectContaining({
                qrHash: expect.any(String),
                qrDisplayTtl: expect.any(Number),
                qrHashTtl: expect.any(Number),
                tickets: expect.arrayContaining([
                  expect.objectContaining({
                    uuid: ticket2.uuid,
                    hash: ticket2.hash,
                    imageUrl: ticket2.imageUrl,
                    status: ticket2.status,
                    purchaseId: ticket2.purchaseId,
                    ticketType: expect.objectContaining({
                      uuid: ticketType.uuid,
                      name: ticketType.name,
                      description: ticketType.description,
                      ticketDateStart: ticketType.ticketDateStart,
                      ticketDateEnd: ticketType.ticketDateEnd,
                      event: expect.objectContaining({
                        uuid: event.uuid,
                        name: event.name,
                        shortDescription: event.shortDescription,
                        longDescription: event.longDescription,
                      }),
                    }),
                  }),
                ]),
              }),
            ]),
          );
          expect(response.status).toBe(HttpStatus.OK);
        });
    });

    it(`should respond with qr code data successfully for 'all' redeem mode`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await EventFactory.create({ ticketProviderId: ticketProvider.id });
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '125.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
      });
      const user = await UserFactory.create({ ticketProviderId: ticketProvider.id });
      const purchaseId = uuid();
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
        status: TicketStatus.Validated,
        ticketTypeId: ticketType.id,
        eventId: event.id,
        purchaseId,
      });
      const redeem = await RedeemFactory.create({
        purchaseId: ticket.purchaseId,
        userId: user.id,
        status: RedeemStatus.NotRedeemed,
        mode: RedeemMode.All,
      });
      const message = await MessageFactory.create({
        ticketId: ticket.id,
        redeemId: redeem.id,
        sendTo: user.phoneNumber,
        purchaseId: ticket.purchaseId,
      });

      await RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket.id });
      await RedeemTicketFactory.create({ redeemId: redeem.id, ticketId: ticket2.id });
      await qrService.generateDisplayToken(redeem.uuid);

      await request(app.getHttpServer())
        .post(`/api/v1/redeem/${redeem.uuid}/qr`)
        .set('Accept', 'application/json')
        .then((response) => {
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                qrHash: expect.any(String),
                qrDisplayTtl: expect.any(Number),
                qrHashTtl: expect.any(Number),
                tickets: expect.arrayContaining([
                  expect.objectContaining({
                    uuid: ticket.uuid,
                    hash: ticket.hash,
                    imageUrl: ticket.imageUrl,
                    status: ticket.status,
                    purchaseId: ticket.purchaseId,
                    ticketType: {
                      uuid: ticketType.uuid,
                      name: ticketType.name,
                      description: ticketType.description,
                      ticketDateStart: ticketType.ticketDateStart,
                      ticketDateEnd: ticketType.ticketDateEnd,
                      event: {
                        uuid: event.uuid,
                        name: event.name,
                        shortDescription: event.shortDescription,
                        longDescription: event.longDescription,
                      },
                    },
                  }),
                  expect.objectContaining({
                    uuid: ticket2.uuid,
                    hash: ticket2.hash,
                    imageUrl: ticket2.imageUrl,
                    status: ticket2.status,
                    purchaseId: ticket2.purchaseId,
                    ticketType: {
                      uuid: ticketType.uuid,
                      name: ticketType.name,
                      description: ticketType.description,
                      ticketDateStart: ticketType.ticketDateStart,
                      ticketDateEnd: ticketType.ticketDateEnd,
                      event: {
                        uuid: event.uuid,
                        name: event.name,
                        shortDescription: event.shortDescription,
                        longDescription: event.longDescription,
                      },
                    },
                  }),
                ]),
              }),
            ]),
          );
          expect(response.status).toBe(HttpStatus.OK);
        });
    });
  });
});
