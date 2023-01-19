import { v4 as uuid } from 'uuid';
import { Event } from '../event.entity';

export class EventUpdateMessage {
  operationUuid: string;
  event: Event;

  constructor(data: Partial<EventUpdateMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
