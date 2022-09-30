export class TicketAdditionalData {
  [key: string]: string | number;
}

export enum TicketStatus {
  Creating = 'creating',
  Active = 'active',
}
