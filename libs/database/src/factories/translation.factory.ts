import { AppDataSource } from '@app/common/configs/datasource';
import { Translation } from '@app/translation/translation.entity';
import { EntityName, Locale } from '@app/translation/translation.types';
import { faker } from '@faker-js/faker';

export class TranslationFactory {
  static async create(data?: Partial<Translation>) {
    const translation = new Translation();
    translation.locale = Locale.en_US;
    translation.entityName = EntityName.Event;
    translation.text = faker.random.word();

    return AppDataSource.manager.getRepository(Translation).save({ ...translation, ...data });
  }
}
