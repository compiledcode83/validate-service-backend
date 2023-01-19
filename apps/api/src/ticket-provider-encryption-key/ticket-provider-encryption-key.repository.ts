import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TicketProviderEncryptionKey } from './ticket-provider-encryption-key.entity';

@Injectable()
export class TicketProviderEncryptionKeyRepository extends Repository<TicketProviderEncryptionKey> {
  constructor(private readonly dataSource: DataSource) {
    super(TicketProviderEncryptionKey, dataSource.manager);
  }

  async findByVersion(version: number, ticketProviderId: number): Promise<TicketProviderEncryptionKey> {
    return this.findOne({
      where: { version, ticketProviderId },
    });
  }

  async getCurrentVersion(ticketProviderId: number): Promise<TicketProviderEncryptionKey> {
    return this.findOne({
      where: { ticketProviderId },
      order: { version: 'DESC' },
    });
  }
}
