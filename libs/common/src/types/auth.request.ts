import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Request } from 'express';

export interface AuthRequest extends Request {
  ticketProvider: TicketProvider;
}
