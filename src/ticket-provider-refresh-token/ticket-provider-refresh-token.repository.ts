import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { RefreshTokensDto } from '@src/auth/dto/refresh-tokens.dto';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { randomBytes } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { TicketProviderRefreshToken } from './ticket-provider-refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '@src/auth/dto/login.dto';

@Injectable()
export class TicketProviderRefreshTokenRepository extends Repository<TicketProviderRefreshToken> {
  constructor(private readonly dataSource: DataSource, private readonly configService: ConfigService) {
    super(TicketProviderRefreshToken, dataSource.manager);
  }

  async createRefreshToken(
    ticketProvider: TicketProvider,
    params: RefreshTokensDto | LoginDto,
  ): Promise<TicketProviderRefreshToken> {
    const refreshToken = this.create({
      ticketProviderId: ticketProvider.id,
      token: randomBytes(32).toString('hex'),
      ip: params.ip,
      userAgent: params.headers?.['user-agent'] || null,
      fingerprint: params.fingerprint,
      expireAt: DateTime.now()
        .plus({ days: this.configService.get('jwtConfig.refreshTokenDurationDays') })
        .toJSDate(),
    });

    return this.save(refreshToken);
  }
}
