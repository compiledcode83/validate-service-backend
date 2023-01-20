import { User } from '@api/user/user.entity';
import { EncryptedData } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.types';
import { v4 as uuid } from 'uuid';
import { Ticket } from '../ticket.entity';

export class TicketCreateMessage {
  operationUuid: string;
  ticket: Ticket;
  user: User;
  encryptedData?: EncryptedData;

  constructor(data: Partial<TicketCreateMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
