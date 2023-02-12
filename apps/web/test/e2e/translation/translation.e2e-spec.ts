import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
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
import { MessageEventPattern, MessageType } from '@app/message/message.types';
import { ListingFactory } from '@app/database/factories/listing.factory';
import { EventFactory } from '@app/database/factories/event.factory';
import { TicketTypeFactory } from '@app/database/factories/ticket-type.factory';
import { DATE_FORMAT, TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { RedeemMode, RedeemStatus } from '@app/redeem/redeem.types';
import { RedeemFactory } from '@app/database/factories/redeem.factory';
import { Redeem } from '@app/redeem/redeem.entity';
import { RedeemTicket } from '@app/redeem/redeem-ticket.entity';
import { OutboxStatus } from '@app/outbox/outbox.types';
import { Outbox } from '@app/outbox/outbox.entity';
import { Message } from '@app/message/message.entity';
import { MessageSendMessage } from '@app/message/messages/message-send.message';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { EntityName, Locale } from '@app/translation/translation.types';
import { MarketType } from '@app/common/types/market-type.enum';
import { faker } from '@faker-js/faker';
import { Event } from '@app/event/event.entity';
import { TranslationFactory } from '@app/database/factories/translation.factory';
import { EventTranslatableAttributes } from '@app/event/event.types';

describe('Translation (e2e)', () => {
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

  describe('Events', () => {
    it(`should get events in English language by passing en_US header`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await AppDataSource.manager.getRepository(Event).save(
        AppDataSource.getRepository(Event).create({
          uuid: faker.datatype.uuid(),
          imageUrl: faker.image.imageUrl(),
          websiteUrl: faker.internet.url(),
          ticketProviderId: ticketProvider.id,
          dateStart: DateTime.now().plus({ days: 30 }).toUTC().toFormat(DATE_FORMAT),
          dateEnd: DateTime.now().plus({ days: 45 }).toUTC().toFormat(DATE_FORMAT),
        }),
      );
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '100.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
        ticketDateStart: DateTime.now().plus({ days: 30 }).toJSDate(),
        ticketDateEnd: DateTime.now().plus({ days: 35 }).toJSDate(),
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.en_US,
        entityAttribute: EventTranslatableAttributes.Name,
        text: 'English Name',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.en_US,
        entityAttribute: EventTranslatableAttributes.ShortDescription,
        text: 'English ShortDescription',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.en_US,
        entityAttribute: EventTranslatableAttributes.LongDescription,
        text: 'English LongDescription',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.pt_BR,
        entityAttribute: EventTranslatableAttributes.Name,
        text: 'Portugese Name',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.pt_BR,
        entityAttribute: EventTranslatableAttributes.ShortDescription,
        text: 'Portugese ShortDescription',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.pt_BR,
        entityAttribute: EventTranslatableAttributes.LongDescription,
        text: 'Portugese LongDescription',
      });

      await request(app.getHttpServer())
        .get(`/api/v1/events`)
        .query({
          marketType: MarketType.Primary,
        })
        .set('Accept', 'application/json')
        .set('Accept-Language', Locale.en_US)
        .then((response) => {
          expect(response.body.data).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                uuid: event.uuid,
                name: 'English Name',
                shortDescription: 'English ShortDescription',
                longDescription: 'English LongDescription',
              }),
            ]),
          );
          expect(response.status).toBe(HttpStatus.OK);
        });
    });

    it(`should get events in Portugese language by passing pt_BR header`, async () => {
      const ticketProvider = await TicketProviderFactory.create();
      const event = await AppDataSource.manager.getRepository(Event).save(
        AppDataSource.getRepository(Event).create({
          uuid: faker.datatype.uuid(),
          imageUrl: faker.image.imageUrl(),
          websiteUrl: faker.internet.url(),
          ticketProviderId: ticketProvider.id,
          dateStart: DateTime.now().plus({ days: 30 }).toUTC().toFormat(DATE_FORMAT),
          dateEnd: DateTime.now().plus({ days: 45 }).toUTC().toFormat(DATE_FORMAT),
        }),
      );
      const ticketType = await TicketTypeFactory.create({
        saleEnabled: TicketTypeSaleStatus.Enabled,
        saleAmount: 4,
        saleEnabledFromDate: DateTime.now().minus({ month: 1 }).toJSDate(),
        saleEnabledToDate: DateTime.now().plus({ month: 1 }).toJSDate(),
        salePrice: '100.00',
        saleCurrency: CurrencyEnum.AED,
        eventId: event.id,
        ticketDateStart: DateTime.now().plus({ days: 30 }).toJSDate(),
        ticketDateEnd: DateTime.now().plus({ days: 35 }).toJSDate(),
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.en_US,
        entityAttribute: EventTranslatableAttributes.Name,
        text: 'English Name',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.en_US,
        entityAttribute: EventTranslatableAttributes.ShortDescription,
        text: 'English ShortDescription',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.en_US,
        entityAttribute: EventTranslatableAttributes.LongDescription,
        text: 'English LongDescription',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.pt_BR,
        entityAttribute: EventTranslatableAttributes.Name,
        text: 'Portugese Name',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.pt_BR,
        entityAttribute: EventTranslatableAttributes.ShortDescription,
        text: 'Portugese ShortDescription',
      });
      await TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: event.id,
        locale: Locale.pt_BR,
        entityAttribute: EventTranslatableAttributes.LongDescription,
        text: 'Portugese LongDescription',
      });

      await request(app.getHttpServer())
        .get(`/api/v1/events`)
        .query({
          marketType: MarketType.Primary,
        })
        .set('Accept', 'application/json')
        .set('Accept-Language', Locale.pt_BR)
        .then((response) => {
          expect(response.body.data).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                uuid: event.uuid,
                name: 'English Name',
                shortDescription: 'English ShortDescription',
                longDescription: 'English LongDescription',
              }),
            ]),
          );
          expect(response.status).toBe(HttpStatus.OK);
        });
    });
  });
});
