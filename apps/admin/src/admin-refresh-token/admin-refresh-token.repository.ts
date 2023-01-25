import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { randomBytes } from 'node:crypto';
import { RefreshTokensDto } from '@admin/auth/dto/refresh-tokens.dto';
import { Admin } from '@admin/admin/admin.entity';
import { AdminRefreshToken } from './admin-refresh-token.entity';
import { LoginDto } from '@admin/auth/dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminRefreshTokenRepository extends Repository<AdminRefreshToken> {
  constructor(public readonly dataSource: DataSource, private readonly configService: ConfigService) {
    super(AdminRefreshToken, dataSource.manager);
  }

  async createRefreshToken(admin: Admin, params: RefreshTokensDto | LoginDto): Promise<AdminRefreshToken> {
    const refreshToken = this.create({
      adminId: admin.id,
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
