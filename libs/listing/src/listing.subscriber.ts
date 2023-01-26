import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { Listing } from './listing.entity';
import { v4 as uuid } from 'uuid';

@EventSubscriber()
export class ListingSubscriber implements EntitySubscriberInterface<Listing> {
  listenTo(): any {
    return Listing;
  }

  beforeInsert(event: InsertEvent<Listing>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }

  beforeUpdate(event: UpdateEvent<Listing>): void {
    event.entity.updatedAt = new Date();
  }
}
