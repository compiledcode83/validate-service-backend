import { Repository } from 'typeorm';
import { TicketProvider } from './ticket-provider.entity';

export class TicketProviderRepository extends Repository<TicketProvider> {
  async findById(id: number) {
    return this.findOne({ where: { id } });
  }
}
