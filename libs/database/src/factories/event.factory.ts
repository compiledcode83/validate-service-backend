import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { AppDataSource } from '@app/common/configs/datasource';
import { Event } from '@app/event/event.entity';

export class EventFactory {
  static async create(data?: Partial<Event>) {
    const event = new Event();
    event.uuid = uuid();
    event.name = faker.name.firstName();
    event.description = faker.random.words(10);
    event.imageUrl = faker.image.imageUrl();
    event.websiteUrl = faker.internet.url();

    return AppDataSource.manager.getRepository(Event).save({ ...event, ...data });
  }
}
