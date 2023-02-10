import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { TicketType } from './ticket-type.entity';

@Injectable()
export class TicketTypeRepository extends Repository<TicketType> {
  constructor(public readonly dataSource: DataSource) {
    super(TicketType, dataSource.manager);
  }
}
