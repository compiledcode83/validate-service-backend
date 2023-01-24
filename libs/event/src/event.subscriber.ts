import {
  EntitySubscriberInterface,
  EventSubscriber as EventSubscriberDecorator,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Event } from './event.entity';
import { EventHelper } from './event.helper';

@EventSubscriberDecorator()
export class EventSubscriber implements EntitySubscriberInterface<Event> {
  listenTo(): any {
    return Event;
  }

  beforeInsert(event: InsertEvent<Event>): void {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }

  beforeUpdate(event: UpdateEvent<Event>): void {
    event.entity.updatedAt = new Date();
  }

  afterLoad(entity: Event): void {
    entity.ticketsInformation = EventHelper.getTicketsInformation(entity);

    const dates = EventHelper.getEventDates(entity);

    entity.dateStart = dates.dateStart;
    entity.dateEnd = dates.dateEnd;
  }
}
