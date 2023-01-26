import { Ticket } from '@app/ticket';
import { v4 as uuid } from 'uuid';

export class TicketValidateMessage {
  operationUuid: string;
  ticket: Ticket;

  constructor(data: Partial<TicketValidateMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
