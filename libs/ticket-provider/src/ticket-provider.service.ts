import { Injectable } from '@nestjs/common';
import { TicketProviderRepository } from './ticket-provider.repository';

@Injectable()
export class TicketProviderService {
  constructor(private readonly ticketProviderRepo: TicketProviderRepository) {}

  async findById(ticketProviderId: number) {
    return this.ticketProviderRepo.findById(ticketProviderId);
  }
}
