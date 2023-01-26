import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { RefreshTokensDto } from '@web/auth/dto/refresh-tokens.dto';
import { randomBytes } from 'node:crypto';
import { DataSource, Repository } from 'typeorm';
import { UserRefreshToken } from './user-refresh-token.entity';
import { ConfigService } from '@nestjs/config';
import { VerifyAuthCodeDto } from '@web/auth/dto/verify-auth-code.dto';
import { User } from '@app/user/user.entity';

@Injectable()
export class UserRefreshTokenRepository extends Repository<UserRefreshToken> {
  constructor(private readonly dataSource: DataSource, private readonly configService: ConfigService) {
    super(UserRefreshToken, dataSource.manager);
  }

  async createRefreshToken(user: User, params: RefreshTokensDto | VerifyAuthCodeDto): Promise<UserRefreshToken> {
    const refreshToken = this.create({
      userId: user.id,
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
