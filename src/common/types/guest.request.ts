import { Request } from 'express';

export interface GuestRequest extends Request {
  guest?: string;
}
