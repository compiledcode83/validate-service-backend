import { Ticket } from '@src/ticket/ticket.entity';
import { User } from '@src/user/user.entity';

export class TicketCreateReplyMessage {
  operationUuid: string;
  ticket: Ticket;
  user: User;
  errorData?: string;
}
