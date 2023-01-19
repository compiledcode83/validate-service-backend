import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { Request } from 'express';

export interface AccessTokenInterface {
  uuid: string;
  name: string;
  email: string;
}

export interface AuthRequest extends Request {
  ticketProvider: TicketProvider;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GuestRequest extends Request {}
