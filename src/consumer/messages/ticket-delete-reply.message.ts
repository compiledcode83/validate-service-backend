import { Ticket } from '@src/ticket/ticket.entity';

export class TicketDeleteReplyMessage {
  ticket: Ticket;
  transactionHash?: string;
  errorData?: string;
}
