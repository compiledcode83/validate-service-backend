import { Injectable } from '@nestjs/common';
import { RefreshTokensDto } from '@api/auth/dto/refresh-tokens.dto';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { TicketProviderRefreshToken } from './ticket-provider-refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import { TicketProviderRefreshTokenRepository } from './ticket-provider-refresh-token.repository';
import { LoginDto } from '@api/auth/dto/login.dto';

@Injectable()
export class TicketProviderRefreshTokenService {
  constructor(
    private readonly ticketProviderRefreshTokenRepo: TicketProviderRefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async findOneBy(params: Partial<TicketProviderRefreshToken>): Promise<TicketProviderRefreshToken> {
    return this.ticketProviderRefreshTokenRepo.findOneBy({ ...params });
  }

  async deleteByToken(token: string): Promise<boolean> {
    const deleteResult = await this.ticketProviderRefreshTokenRepo.delete({ token });

    return deleteResult.affected === 1;
  }

  async create(
    ticketProvider: TicketProvider,
    params: RefreshTokensDto | LoginDto,
  ): Promise<TicketProviderRefreshToken> {
    return this.ticketProviderRefreshTokenRepo.createRefreshToken(ticketProvider, params);
  }
}
