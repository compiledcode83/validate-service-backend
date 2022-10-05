import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuid } from 'uuid';
import { UserSeedGenerator } from './user-seed.generator';
import { SEED_PHRASE_LENGTH } from './user.types';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): any {
    return User;
  }

  beforeInsert(event: InsertEvent<User>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }

    event.entity.seedPhrase = UserSeedGenerator.generate(SEED_PHRASE_LENGTH);
  }

  beforeUpdate(event: UpdateEvent<User>): void {
    event.entity.updatedAt = new Date();
  }
}
