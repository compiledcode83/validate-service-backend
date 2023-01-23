import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketProviderRepository extends Repository<TicketProvider> {
  constructor(public readonly dataSource: DataSource) {
    super(TicketProvider, dataSource.manager);
  }

  async findById(id: number) {
    return this.findOne({ where: { id } });
  }

  async findMany(id: number) {
    return this.find({ where: { id } });
  }
}
