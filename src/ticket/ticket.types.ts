export class TicketAdditionalData {
  [key: string]: string | number;
}

export enum TicketStatus {
  Creating = 'creating',
  Active = 'active',
  Validated = 'validated',
}

export interface TicketMintMessage {
  ticketUuid: string;
  name: string;
  description: string;
  image: string;
  additionalData: Record<string, any>;
}

export interface TicketTransferMessage {
  transferUuid: string;
  userUuidFrom: string;
  userUuidTo: string;
  tokenId: number;
}
