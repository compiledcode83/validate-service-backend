import { EventRepository } from '@api/event/event.repository';
import { AppDataSource } from '@app/common/configs/datasource';
import { RepositoryHelper } from '@app/common/helpers/repository.helper';
import { TestHelper } from '@app/common/helpers/test.helper';
import { EventFactory } from '@app/database/factories/event.factory';
import { TicketProviderFactory } from '@app/database/factories/ticket-provider.factory';
import { TranslationFactory } from '@app/database/factories/translation.factory';
import { Event } from '@app/event/event.entity';
import { EventTranslatableAttributes } from '@app/event/event.types';
import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { Translation } from './translation.entity';
import { TranslationService } from './translation.service';
import { EntityName, Locale } from './translation.types';

describe('TranslationService', () => {
  let service: TranslationService;
  let testHelper: TestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranslationService],
    }).compile();

    service = module.get<TranslationService>(TranslationService);
    testHelper = new TestHelper(module, jest);

    await AppDataSource.initialize();
    await testHelper.cleanDatabase();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should check that new translation gets saved', async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const ticketProvider = await TicketProviderFactory.create();
    const event = await AppDataSource.manager.getRepository(Event).save(
      AppDataSource.getRepository(Event).create({
        uuid: faker.datatype.uuid(),
        imageUrl: faker.image.imageUrl(),
        websiteUrl: faker.internet.url(),
        ticketProviderId: ticketProvider.id,
      }),
    );
    const translations = [
      { name: EventTranslatableAttributes.Name, value: 'English Name' },
      { name: EventTranslatableAttributes.ShortDescription, value: 'English ShortDescription' },
      { name: EventTranslatableAttributes.LongDescription, value: 'English LongDescription' },
    ];

    await service.saveTranslations(queryRunner, EntityName.Event, event.id, translations, Locale.en_US);

    await queryRunner.commitTransaction();

    expect(await AppDataSource.getRepository(Translation).find()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityName: EntityName.Event,
          entityId: event.id,
          locale: Locale.en_US,
          entityAttribute: EventTranslatableAttributes.Name,
          text: 'English Name',
        }),
        expect.objectContaining({
          entityName: EntityName.Event,
          entityId: event.id,
          locale: Locale.en_US,
          entityAttribute: EventTranslatableAttributes.ShortDescription,
          text: 'English ShortDescription',
        }),
        expect.objectContaining({
          entityName: EntityName.Event,
          entityId: event.id,
          locale: Locale.en_US,
          entityAttribute: EventTranslatableAttributes.LongDescription,
          text: 'English LongDescription',
        }),
      ]),
    );
  });

  it('should check that existing translation gets updated', async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const ticketProvider = await TicketProviderFactory.create();
    const event = await AppDataSource.manager.getRepository(Event).save(
      AppDataSource.getRepository(Event).create({
        uuid: faker.datatype.uuid(),
        imageUrl: faker.image.imageUrl(),
        websiteUrl: faker.internet.url(),
        ticketProviderId: ticketProvider.id,
      }),
    );

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

    const newTranslations = [
      { name: EventTranslatableAttributes.Name, value: 'English Name 2' },
      { name: EventTranslatableAttributes.ShortDescription, value: 'English ShortDescription 2' },
      { name: EventTranslatableAttributes.LongDescription, value: 'English LongDescription 2' },
    ];

    await service.saveTranslations(queryRunner, EntityName.Event, event.id, newTranslations, Locale.en_US);

    await queryRunner.commitTransaction();

    expect(await AppDataSource.getRepository(Translation).find()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityName: EntityName.Event,
          entityId: event.id,
          locale: Locale.en_US,
          entityAttribute: EventTranslatableAttributes.Name,
          text: 'English Name 2',
        }),
        expect.objectContaining({
          entityName: EntityName.Event,
          entityId: event.id,
          locale: Locale.en_US,
          entityAttribute: EventTranslatableAttributes.ShortDescription,
          text: 'English ShortDescription 2',
        }),
        expect.objectContaining({
          entityName: EntityName.Event,
          entityId: event.id,
          locale: Locale.en_US,
          entityAttribute: EventTranslatableAttributes.LongDescription,
          text: 'English LongDescription 2',
        }),
      ]),
    );
  });

  it('should check that mapEntity method works correctly', async () => {
    const ticketProvider = await TicketProviderFactory.create();
    const event = await AppDataSource.manager.getRepository(Event).save(
      AppDataSource.getRepository(Event).create({
        uuid: faker.datatype.uuid(),
        imageUrl: faker.image.imageUrl(),
        websiteUrl: faker.internet.url(),
        ticketProviderId: ticketProvider.id,
      }),
    );

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

    const eventWithTranslations = await RepositoryHelper.getCustomRepository(EventRepository).findOneBy({
      id: event.id,
    });

    const mappedEntityEnglish = TranslationService.mapEntity(eventWithTranslations, Locale.en_US);

    expect(mappedEntityEnglish).toEqual(
      expect.objectContaining({
        ...event,
        name: 'English Name',
        shortDescription: 'English ShortDescription',
        longDescription: 'English LongDescription',
      }),
    );

    const mappedEntityPortugese = TranslationService.mapEntity(eventWithTranslations, Locale.pt_BR);

    expect(mappedEntityPortugese).toEqual(
      expect.objectContaining({
        ...event,
        name: 'Portugese Name',
        shortDescription: 'Portugese ShortDescription',
        longDescription: 'Portugese LongDescription',
      }),
    );
  });
});
