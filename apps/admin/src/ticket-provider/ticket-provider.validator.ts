import { Injectable } from '@nestjs/common';
import { TicketProviderService } from './ticket-provider.service';

@Injectable()
export class TicketProviderValidator {
  constructor(private readonly ticketProviderService: TicketProviderService) {}

  async isTicketProviderValid(id: number): Promise<boolean> {
    return this.ticketProviderService.isTicketProviderExist(id);
  }
}
