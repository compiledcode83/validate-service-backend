import {
  EntitySubscriberInterface,
  EventSubscriber as EventSubscriberDecorator,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { TicketType } from './ticket-type.entity';

@EventSubscriberDecorator()
export class TicketTypeSubscriber implements EntitySubscriberInterface<TicketType> {
  listenTo(): any {
    return TicketType;
  }

  beforeInsert(event: InsertEvent<TicketType>): void {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }

  beforeUpdate(event: UpdateEvent<TicketType>): void {
    event.entity.updatedAt = new Date();
  }
}
