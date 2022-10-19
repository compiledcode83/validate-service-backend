export class TicketAdditionalData {
  [key: string]: string | number;
}

export enum TicketStatus {
  Creating = 'creating',
  Active = 'active',
  Validated = 'validated',
}

export interface TicketMintMessage {
  operationUuid: string;
  ticketUuid: string;
  userUuid: string;
  name: string;
  description: string;
  image: string;
  additionalData: Record<string, any>;
}

export interface TicketTransferMessage {
  operationUuid: string;
  transferUuid: string;
  userUuidFrom: string;
  userUuidTo: string;
  tokenId: number;
}
