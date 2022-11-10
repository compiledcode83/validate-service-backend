import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { DateTime } from 'luxon';
import { Ticket } from './ticket.entity';
import { DATE_FORMAT } from './ticket.types';

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

  afterLoad(entity: Ticket): void {
    if (entity.dateStart) {
      entity.dateStart = DateTime.fromJSDate(entity.dateStart).toFormat(DATE_FORMAT) as any;
    }

    if (entity.dateEnd) {
      entity.dateEnd = DateTime.fromJSDate(entity.dateEnd).toFormat(DATE_FORMAT) as any;
    }
  }
}
