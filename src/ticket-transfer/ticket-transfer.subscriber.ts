import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { TicketTransfer } from './ticket-transfer.entity';

@EventSubscriber()
export class TicketTransferSubscriber implements EntitySubscriberInterface<TicketTransfer> {
  listenTo(): any {
    return TicketTransfer;
  }

  beforeInsert(event: InsertEvent<TicketTransfer>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }
}
