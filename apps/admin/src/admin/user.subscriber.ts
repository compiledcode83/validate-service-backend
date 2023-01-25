import { EventSubscriber as EventSubscriberDecorator, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Admin } from './admin.entity';

@EventSubscriberDecorator()
export class UserSubscriber implements EntitySubscriberInterface<Admin> {
  listenTo(): any {
    return Admin;
  }

  beforeInsert(admin: InsertEvent<Admin>): void {
    if (!admin.entity.uuid) {
      admin.entity.uuid = uuid();
    }
  }
}
