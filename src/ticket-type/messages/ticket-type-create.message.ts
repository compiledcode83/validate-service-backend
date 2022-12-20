import { v4 as uuid } from 'uuid';
import { TicketType } from '../ticket-type.entity';

export class TicketTypeCreateMessage {
  operationUuid: string;
  ticketType: TicketType;

  constructor(data: Partial<TicketTypeCreateMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
