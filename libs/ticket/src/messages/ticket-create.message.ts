import { User } from '@app/user/user.entity';
import { Ticket } from '@app/ticket';
import { EncryptedData } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.types';
import { v4 as uuid } from 'uuid';

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
