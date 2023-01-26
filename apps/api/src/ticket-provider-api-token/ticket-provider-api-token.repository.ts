import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import { TicketProviderApiToken } from './ticket-provider-api-token.entity';

@Injectable()
export class TicketProviderApiTokenRepository extends Repository<TicketProviderApiToken> {
  constructor(private readonly dataSource: DataSource) {
    super(TicketProviderApiToken, dataSource.manager);
  }

  async findByToken(token: string): Promise<TicketProviderApiToken> {
    return this.findOne({
      where: { token, deletedAt: IsNull() },
      relations: ['ticketProvider'],
    });
  }
}
