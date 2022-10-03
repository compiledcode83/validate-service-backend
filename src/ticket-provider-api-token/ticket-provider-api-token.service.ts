import { Injectable } from '@nestjs/common';
import { TicketProviderApiToken } from './ticket-provider-api-token.entity';
import { TicketProviderApiTokenRepository } from './ticket-provider-api-token.repository';

@Injectable()
export class TicketProviderApiTokenService {
  constructor(private readonly ticketProviderApiTokenRepository: TicketProviderApiTokenRepository) {}

  async findByToken(token: string): Promise<TicketProviderApiToken> {
    return this.ticketProviderApiTokenRepository.findByToken(token);
  }
}
