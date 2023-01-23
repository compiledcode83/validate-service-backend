import {
  EntitySubscriberInterface,
  EventSubscriber as EventSubscriberDecorator,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { TicketType } from './ticket-type.entity';
import { DATE_FORMAT } from './ticket-type.types';

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

  afterLoad(entity: TicketType): void {
    if (entity.ticketDateStart) {
      entity.ticketDateStart = DateTime.fromJSDate(entity.ticketDateStart).toFormat(DATE_FORMAT) as any;
    }

    if (entity.ticketDateEnd) {
      entity.ticketDateEnd = DateTime.fromJSDate(entity.ticketDateEnd).toFormat(DATE_FORMAT) as any;
    }
  }
}
