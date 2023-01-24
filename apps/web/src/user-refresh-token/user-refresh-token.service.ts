import { Injectable } from '@nestjs/common';
import { RefreshTokensDto } from '@web/auth/dto/refresh-tokens.dto';
import { UserRefreshTokenRepository } from './user-refresh-token.repository';
import { UserRefreshToken } from './user-refresh-token.entity';
import { VerifyAuthCodeDto } from '@web/auth/dto/verify-auth-code.dto';
import { User } from '@app/user/user.entity';

@Injectable()
export class UserRefreshTokenService {
  constructor(private readonly userRefreshTokenRepo: UserRefreshTokenRepository) {}

  async findOneBy(params: Partial<UserRefreshToken>): Promise<UserRefreshToken> {
    return this.userRefreshTokenRepo.findOneBy({ ...params });
  }

  async deleteByToken(token: string): Promise<boolean> {
    const deleteResult = await this.userRefreshTokenRepo.delete({ token });

    return deleteResult.affected === 1;
  }

  async create(user: User, params: RefreshTokensDto | VerifyAuthCodeDto): Promise<UserRefreshToken> {
    return this.userRefreshTokenRepo.createRefreshToken(user, params);
  }
}
