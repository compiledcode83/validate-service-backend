import { User } from '@app/user/user.entity';
import { Request } from 'express';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';

export interface AccessTokenInterface {
  uuid: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface AuthRequest extends Request {
  user: User;
  ticketProvider: TicketProvider;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GuestRequest extends Request {}
