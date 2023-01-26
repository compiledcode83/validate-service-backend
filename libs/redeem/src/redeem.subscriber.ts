import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Redeem } from './redeem.entity';

@EventSubscriber()
export class RedeemSubscriber implements EntitySubscriberInterface<Redeem> {
  listenTo(): any {
    return Redeem;
  }

  beforeInsert(event: InsertEvent<Redeem>): void | Promise<any> {
    if (!event.entity.uuid) {
      event.entity.uuid = uuid();
    }
  }
}
