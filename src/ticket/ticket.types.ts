export class TicketAdditionalData {
  [key: string]: string | number;
}

export enum TicketStatus {
  Creating = 'creating',
  Active = 'active',
  Validated = 'validated',
  Deleted = 'deleted',
}

export enum TicketEventPattern {
  Create = 'ticket.create',
  Delete = 'ticket.delete',
}

export const DATE_FORMAT = 'yyyy-MM-dd';
