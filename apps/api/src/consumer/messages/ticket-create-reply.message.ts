import { Ticket } from '@api/ticket/ticket.entity';
import { User } from '@api/user/user.entity';

export class TicketCreateReplyMessage {
  operationUuid: string;
  ticket: Ticket;
  user: User;
  errorData?: string;

  constructor(data: Partial<TicketCreateReplyMessage>) {
    Object.assign(this, data);
  }
}
