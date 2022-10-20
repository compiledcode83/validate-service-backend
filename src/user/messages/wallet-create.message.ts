import { v4 as uuid } from 'uuid';

export class WalletCreateMessage {
  operationUuid: string;
  userUuid: string;

  constructor(data: Partial<WalletCreateMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
