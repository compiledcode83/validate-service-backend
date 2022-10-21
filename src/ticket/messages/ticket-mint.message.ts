import { EncryptedData } from '@src/ticket-provider-encryption-key/ticket-provider-encryption.types';
import { v4 as uuid } from 'uuid';

export class TicketMintMessage {
  operationUuid: string;
  ticketUuid: string;
  userUuid: string;
  name: string;
  description: string;
  image: string;
  additionalData: Record<string, any>;
  user?: EncryptedData;

  constructor(data: Partial<TicketMintMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
