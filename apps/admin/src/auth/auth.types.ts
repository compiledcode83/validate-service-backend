import { Admin } from '@admin/admin/admin.entity';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { User } from '@app/user/user.entity';
import { Request } from 'express';

export interface AccessTokenInterface {
  uuid: string;
  name: string;
  email: string;
}

export interface AuthRequest extends Request {
  admin: Admin;
  ticketProvider: TicketProvider;
  user: User;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GuestRequest extends Request {}
