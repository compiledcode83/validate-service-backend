import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Injectable } from '@nestjs/common';
import { TicketProviderRepository } from './ticket-provider.repository';

@Injectable()
export class TicketProviderService {
  constructor(private readonly ticketProviderRepository: TicketProviderRepository) {}

  async findOne(id: number): Promise<TicketProvider> {
    return this.ticketProviderRepository.findById(id);
  }

  async findByEmail(email: string): Promise<TicketProvider> {
    return this.ticketProviderRepository.findOneBy({ email });
  }

  async findByUuid(uuid: string): Promise<TicketProvider> {
    return this.ticketProviderRepository.findOneBy({ uuid });
  }
}
