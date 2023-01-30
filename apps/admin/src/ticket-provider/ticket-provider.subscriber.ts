import { EventSubscriber as EventSubscriberDecorator, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';

@EventSubscriberDecorator()
export class TicketProviderSubscriber implements EntitySubscriberInterface<TicketProvider> {
  listenTo(): any {
    return TicketProvider;
  }

  beforeInsert(ticketProvider: InsertEvent<TicketProvider>): void {
    if (!ticketProvider.entity.uuid) {
      ticketProvider.entity.uuid = uuid();
    }
  }
}
