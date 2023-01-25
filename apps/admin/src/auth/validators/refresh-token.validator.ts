import { DateTime } from 'luxon';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RefreshTokensDto } from '../dto/refresh-tokens.dto';
import { AdminRefreshTokenService } from '@admin/admin-refresh-token/admin-refresh-token.service';

@ValidatorConstraint({ name: 'refreshTokenValidator', async: true })
export class RefreshTokenValidator implements ValidatorConstraintInterface {
  constructor(private readonly adminRefreshTokenService: AdminRefreshTokenService) {}

  async validate(token: string, args: ValidationArguments): Promise<boolean> {
    const { fingerprint } = args.object as RefreshTokensDto;

    const refreshToken = await this.adminRefreshTokenService.findOneBy({ token, fingerprint });

    return refreshToken && DateTime.fromJSDate(refreshToken.expireAt) > DateTime.now();
  }

  defaultMessage() {
    return `Refresh token not found or expired`;
  }
}
