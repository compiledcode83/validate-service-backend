import { Injectable } from '@nestjs/common';
import { DataSource, Not, Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { TicketStatus } from './ticket.types';

@Injectable()
export class TicketRepository extends Repository<Ticket> {
  constructor(public readonly dataSource: DataSource) {
    super(Ticket, dataSource.manager);
  }

  async findByUuid(uuid: string, relations: string[] = ['user']): Promise<Ticket> {
    return this.findOne({ where: { uuid, status: Not(TicketStatus.Deleted) }, relations });
  }
}
