import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { AppDataSource } from '@app/common/configs/datasource';
import { Event } from '@app/event/event.entity';
import { TranslationFactory } from './translation.factory';
import { EntityName, Locale } from '@app/translation/translation.types';
import { EventTranslatableAttributes } from '@app/event/event.types';
import { RepositoryHelper } from '@app/common/helpers/repository.helper';
import { EventRepository } from '@api/event/event.repository';
import { TranslationService } from '@app/translation/translation.service';

export class EventFactory {
  static async create(data?: Partial<Event>, locale: Locale = Locale.en_US) {
    const event = new Event();
    event.uuid = uuid();
    event.imageUrl = faker.image.imageUrl();
    event.websiteUrl = faker.internet.url();

    const savedEvent = await AppDataSource.manager.getRepository(Event).save({ ...event, ...data });

    await Promise.all([
      TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: savedEvent.id,
        text: faker.random.word(),
        entityAttribute: EventTranslatableAttributes.Name,
      }),
      TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: savedEvent.id,
        text: faker.random.words(10),
        entityAttribute: EventTranslatableAttributes.ShortDescription,
      }),
      TranslationFactory.create({
        entityName: EntityName.Event,
        entityId: savedEvent.id,
        text: faker.random.words(100),
        entityAttribute: EventTranslatableAttributes.LongDescription,
      }),
    ]);

    const savedWithTranslations = await RepositoryHelper.getCustomRepository(EventRepository).findOneBy({
      id: savedEvent.id,
    });

    TranslationService.mapEntity(savedWithTranslations, locale);

    return savedWithTranslations;
  }
}
