import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { TranslationFactory } from './translation.factory';
import { EntityName, Locale } from '@app/translation/translation.types';
import { TicketTypeTranslatableAttributes } from '@app/ticket-type/ticket-type.types';
import { RepositoryHelper } from '@app/common/helpers/repository.helper';
import { TicketTypeRepository } from '@api/ticket-type/ticket-type.repository';
import { TranslationService } from '@app/translation/translation.service';

export class TicketTypeFactory {
  static async create(data?: Partial<TicketType>, locale: Locale = Locale.en_US) {
    const ticketType = new TicketType();
    ticketType.uuid = uuid();
    ticketType.ticketDateStart = faker.date.future();
    ticketType.ticketDateEnd = faker.date.future();

    const savedTicketType = await AppDataSource.manager.getRepository(TicketType).save({ ...ticketType, ...data });

    await Promise.all([
      TranslationFactory.create({
        entityName: EntityName.TicketType,
        entityId: savedTicketType.id,
        text: faker.random.word(),
        entityAttribute: TicketTypeTranslatableAttributes.Name,
        locale,
      }),
      TranslationFactory.create({
        entityName: EntityName.TicketType,
        entityId: savedTicketType.id,
        text: faker.random.words(10),
        entityAttribute: TicketTypeTranslatableAttributes.Description,
        locale,
      }),
    ]);

    const savedWithTranslations = await RepositoryHelper.getCustomRepository(TicketTypeRepository).findOneBy({
      id: savedTicketType.id,
    });

    TranslationService.mapEntity(savedWithTranslations, locale);

    return savedWithTranslations;
  }
}
