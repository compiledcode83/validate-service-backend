import { Injectable } from '@nestjs/common';
import { TicketService } from './ticket.service';

@Injectable()
export class TicketValidator {
  constructor(private readonly ticketService: TicketService) {}

  async isTicketValid(uuid: string): Promise<boolean> {
    return this.ticketService.isTicketExist(uuid);
  }
}
