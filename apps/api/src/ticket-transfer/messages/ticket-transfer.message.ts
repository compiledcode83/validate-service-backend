import { v4 as uuid } from 'uuid';
import { TicketTransfer } from '../ticket-transfer.entity';

export class TicketTransferMessage {
  operationUuid: string;
  transfer: TicketTransfer;

  constructor(data: Partial<TicketTransferMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
