import { Injectable } from '@nestjs/common';
import { TicketProviderApiTokenService } from '@src/ticket-provider-api-token/ticket-provider-api-token.service';

@Injectable()
export class AuthService {
  constructor(private ticketProviderApiTokenService: TicketProviderApiTokenService) {}

  async validateTicketProvider(token: string): Promise<any> {
    const apiToken = await this.ticketProviderApiTokenService.findByToken(token);

    return apiToken?.ticketProvider ?? null;
  }
}
