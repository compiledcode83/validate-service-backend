import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TicketProviderApiTokenService } from '@api/ticket-provider-api-token/ticket-provider-api-token.service';
import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { TicketProviderService } from '@api/ticket-provider/ticket-provider.service';
import { AccessTokenInterface } from './auth.types';
import { TicketProviderRefreshTokenService } from '@api/ticket-provider-refresh-token/ticket-provider-refresh-token.service';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { TicketProviderRefreshToken } from '@api/ticket-provider-refresh-token/ticket-provider-refresh-token.entity';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private ticketProviderApiTokenService: TicketProviderApiTokenService,
    private ticketProviderService: TicketProviderService,
    private jwtService: JwtService,
    private ticketProviderRefreshTokenService: TicketProviderRefreshTokenService,
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

  async login(ticketProvider: TicketProvider, body: LoginDto): Promise<TokensResponseDto> {
    const accessToken = await this.createAccessToken(ticketProvider);
    const refreshToken = await this.createRefreshToken(ticketProvider, body);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.ticketProviderRefreshTokenService.deleteByToken(refreshToken);
  }

  private async createAccessToken(ticketProvider: TicketProvider): Promise<string> {
    const payload: AccessTokenInterface = {
      name: ticketProvider.name,
      email: ticketProvider.email,
      uuid: ticketProvider.uuid,
    };

    return this.jwtService.signAsync(payload);
  }

  private async createRefreshToken(
    ticketProvider: TicketProvider,
    params: RefreshTokensDto | LoginDto,
  ): Promise<TicketProviderRefreshToken> {
    return this.ticketProviderRefreshTokenService.create(ticketProvider, params);
  }

  async refreshTokens(params: RefreshTokensDto): Promise<TokensResponseDto> {
    const oldRefreshToken = await this.ticketProviderRefreshTokenService.findOneBy({ token: params.refreshToken });

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.ticketProviderRefreshTokenService.deleteByToken(params.refreshToken);
    const ticketProvider = await this.ticketProviderService.findOne(oldRefreshToken.ticketProviderId);

    const accessToken = await this.createAccessToken(ticketProvider);
    const refreshToken = await this.createRefreshToken(ticketProvider, params);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }
}
