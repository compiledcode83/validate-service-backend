import { EncryptedData } from '@src/ticket-provider-encryption-key/ticket-provider-encryption.types';
import { User } from '@src/user/user.entity';
import { v4 as uuid } from 'uuid';
import { Ticket } from '../ticket.entity';

export class TicketValidateMessage {
  operationUuid: string;
  ticket: Ticket;
  user: User;
  encryptedData?: EncryptedData;

  constructor(data: Partial<TicketValidateMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
