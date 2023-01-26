import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Order } from './order.entity';

@EventSubscriber()
export class OrderSubscriber implements EntitySubscriberInterface<Order> {
  listenTo(): any {
    return Order;
  }

  beforeInsert(event: InsertEvent<Order>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }
}
