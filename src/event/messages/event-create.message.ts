import { v4 as uuid } from 'uuid';
import { Event } from '../event.entity';

export class EventCreateMessage {
  operationUuid: string;
  event: Event;

  constructor(data: Partial<EventCreateMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
