import { v4 as uuid } from 'uuid';

export class TicketDeleteMessage {
  operationUuid: string;
  ticketUuid: string;
  tokenId: number;

  constructor(data: Partial<TicketDeleteMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
