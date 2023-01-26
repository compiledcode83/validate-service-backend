import { Ticket } from '@app/ticket/ticket.entity';
import { User } from '@app/user/user.entity';

export class TicketCreateReplyMessage {
  operationUuid: string;
  ticket: Ticket;
  user: User;
  errorData?: string;

  constructor(data: Partial<TicketCreateReplyMessage>) {
    Object.assign(this, data);
  }
}
