import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TicketTransfer } from './ticket-transfer.entity';

@Injectable()
export class TicketTransferRepository extends Repository<TicketTransfer> {
  constructor(public readonly dataSource: DataSource) {
    super(TicketTransfer, dataSource.manager);
  }
}
