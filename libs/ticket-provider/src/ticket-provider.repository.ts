import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TicketProvider } from './ticket-provider.entity';

@Injectable()
export class TicketProviderRepository extends Repository<TicketProvider> {
  constructor(public readonly dataSource: DataSource) {
    super(TicketProvider, dataSource.manager);
  }

  async findById(id: number) {
    return this.findOne({ where: { id } });
  }
}
