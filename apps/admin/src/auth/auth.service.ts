import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Admin } from '@admin/admin/admin.entity';
import { AdminService } from '@admin/admin/admin.service';
import { AdminRefreshTokenService } from '@admin/admin-refresh-token/admin-refresh-token.service';
import { AdminRefreshToken } from '@admin/admin-refresh-token/admin-refresh-token.entity';
import { AccessTokenInterface } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
    private adminRefreshTokenService: AdminRefreshTokenService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Partial<Admin> | null> {
    const admin = await this.adminService.findByEmail(email);
    if (admin && (await bcrypt.compare(pass, admin.password))) {
      return { id: admin.id, name: admin.name, email: admin.email, uuid: admin.uuid };
    }

    return null;
  }

  async login(admin: Admin, body: LoginDto): Promise<TokensResponseDto> {
    const accessToken = await this.createAccessToken(admin);
    const refreshToken = await this.createRefreshToken(admin, body);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.adminRefreshTokenService.deleteByToken(refreshToken);
  }

  private async createAccessToken(admin: Admin): Promise<string> {
    const payload: AccessTokenInterface = {
      name: admin.name,
      email: admin.email,
      uuid: admin.uuid,
    };

    return this.jwtService.signAsync(payload);
  }

  private async createRefreshToken(admin: Admin, params: RefreshTokensDto | LoginDto): Promise<AdminRefreshToken> {
    return this.adminRefreshTokenService.create(admin, params);
  }

  async refreshTokens(params: RefreshTokensDto): Promise<TokensResponseDto> {
    const oldRefreshToken = await this.adminRefreshTokenService.findOneBy({ token: params.refreshToken });

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.adminRefreshTokenService.deleteByToken(params.refreshToken);
    const admin = await this.adminService.findOne(oldRefreshToken.adminId);

    const accessToken = await this.createAccessToken(admin);
    const refreshToken = await this.createRefreshToken(admin, params);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }
}
