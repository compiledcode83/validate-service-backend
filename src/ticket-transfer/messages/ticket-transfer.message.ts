import { v4 as uuid } from 'uuid';

export class TicketTransferMessage {
  operationUuid: string;
  transferUuid: string;
  userUuidFrom: string;
  userUuidTo: string;
  tokenId: number;

  constructor(data: Partial<TicketTransferMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
