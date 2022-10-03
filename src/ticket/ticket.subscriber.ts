import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Ticket } from './ticket.entity';

@EventSubscriber()
export class TicketSubscriber implements EntitySubscriberInterface<Ticket> {
  listenTo(): any {
    return Ticket;
  }

  beforeInsert(event: InsertEvent<Ticket>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }

  beforeUpdate(event: UpdateEvent<Ticket>): void {
    event.entity.updatedAt = new Date();
  }
}
