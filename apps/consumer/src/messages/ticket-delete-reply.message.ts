import { Ticket } from '@app/ticket/ticket.entity';

export class TicketDeleteReplyMessage {
  ticket: Ticket;
  transactionHash?: string;
  errorData?: string;

  constructor(data: Partial<TicketDeleteReplyMessage>) {
    Object.assign(this, data);
  }
}
