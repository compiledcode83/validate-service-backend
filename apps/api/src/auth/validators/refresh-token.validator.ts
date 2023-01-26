import { DateTime } from 'luxon';
import { TicketProviderRefreshTokenService } from '@api/ticket-provider-refresh-token/ticket-provider-refresh-token.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RefreshTokensDto } from '../dto/refresh-tokens.dto';

@ValidatorConstraint({ name: 'refreshTokenValidator', async: true })
export class RefreshTokenValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketProviderRefreshTokenService: TicketProviderRefreshTokenService) {}

  async validate(token: string, args: ValidationArguments): Promise<boolean> {
    const { fingerprint } = args.object as RefreshTokensDto;
    const refreshToken = await this.ticketProviderRefreshTokenService.findOneBy({ token, fingerprint });

    return refreshToken && DateTime.fromJSDate(refreshToken.expireAt) > DateTime.now();
  }

  defaultMessage() {
    return `Refresh token not found or expired`;
  }
}
