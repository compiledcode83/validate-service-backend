import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Message } from './message.entity';

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  listenTo(): any {
    return Message;
  }

  beforeInsert(event: InsertEvent<Message>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }

  beforeUpdate(event: UpdateEvent<Message>): void {
    event.entity.updatedAt = new Date();
  }
}
