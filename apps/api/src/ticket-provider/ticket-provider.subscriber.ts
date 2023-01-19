import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { TicketProvider } from './ticket-provider.entity';

@EventSubscriber()
export class TicketProviderSubscriber implements EntitySubscriberInterface<TicketProvider> {
  listenTo(): any {
    return TicketProvider;
  }

  beforeInsert(event: InsertEvent<TicketProvider>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }
}
