import { Injectable } from '@nestjs/common';
import { RefreshTokensDto } from '@admin/auth/dto/refresh-tokens.dto';
import { Admin } from '@admin/admin/admin.entity';
import { AdminRefreshToken } from './admin-refresh-token.entity';
import { AdminRefreshTokenRepository } from './admin-refresh-token.repository';
import { LoginDto } from '@admin/auth/dto/login.dto';

@Injectable()
export class AdminRefreshTokenService {
  constructor(private readonly adminRefreshTokenRepo: AdminRefreshTokenRepository) {}

  async findOneBy(params: Partial<AdminRefreshToken>): Promise<AdminRefreshToken> {
    return this.adminRefreshTokenRepo.findOneBy({ ...params });
  }

  async deleteByToken(token: string): Promise<boolean> {
    const deleteResult = await this.adminRefreshTokenRepo.delete({ token });

    return deleteResult.affected === 1;
  }

  async create(admin: Admin, params: RefreshTokensDto | LoginDto): Promise<AdminRefreshToken> {
    return this.adminRefreshTokenRepo.createRefreshToken(admin, params);
  }
}
