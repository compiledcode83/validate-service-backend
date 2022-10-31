import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TicketProviderApiTokenService } from '@src/ticket-provider-api-token/ticket-provider-api-token.service';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { TicketProviderService } from '@src/ticket-provider/ticket-provider.service';
import { AccessTokenInterface } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private ticketProviderApiTokenService: TicketProviderApiTokenService,
    private ticketProviderService: TicketProviderService,
    private jwtService: JwtService,
  ) {}

  async validateByApiKey(token: string): Promise<any> {
    const apiToken = await this.ticketProviderApiTokenService.findByToken(token);

    return apiToken?.ticketProvider ?? null;
  }

  async validateByPassword(email: string, password: string): Promise<any> {
    const ticketProvider = await this.ticketProviderService.findByEmail(email);

    if (!ticketProvider) {
      return false;
    }

    const passwordsMatch = await bcrypt.compare(password, ticketProvider.password);

    return passwordsMatch ? ticketProvider : null;
  }

  async validateByAccessToken(payload: AccessTokenInterface): Promise<any> {
    const ticketProvider = await this.ticketProviderService.findByUuid(payload.uuid);

    if (!ticketProvider) {
      return false;
    }

    return ticketProvider;
  }

  async login(ticketProvider: Partial<TicketProvider>) {
    const payload: AccessTokenInterface = {
      name: ticketProvider.name,
      email: ticketProvider.email,
      uuid: ticketProvider.uuid,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
