import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DateTime } from 'luxon';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenInterface } from './auth.types';
import { UserRefreshTokenService } from '@web/user-refresh-token/user-refresh-token.service';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { UserService } from '@web/user/user.service';
import { User } from '@app/user/user.entity';
import { UserRefreshToken } from '@web/user-refresh-token/user-refresh-token.entity';
import { SendAuthCodeDto } from './dto/send-auth-code.dto';
import { VerifyAuthCodeDto } from './dto/verify-auth-code.dto';
import { MessageService } from '@web/message/message.service';
import { randomInt } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { AuthCode } from './auth-code.entity';
import { VerifyAuthCodeResponseDto } from './dto/verify-auth-code-response.dto';
import { AuthCodeRepository } from './auth-code.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authCodeRepository: AuthCodeRepository,
    private readonly userService: UserService,
    private readonly userRefreshTokenService: UserRefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly messageService: MessageService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async validateByAccessToken(payload: AccessTokenInterface): Promise<any> {
    const user = await this.userService.findByUuid(payload.uuid);

    if (!user) {
      return false;
    }

    return user;
  }

  async sendAuthCode(body: SendAuthCodeDto): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const authCode = this.configService.get('authConfig.authCodeFakeGenerator')
        ? 123456
        : randomInt(this.configService.get('authConfig.authCodeMin'), this.configService.get('authConfig.authCodeMax'));
      const authCodeValidMinutes = this.configService.get('authConfig.authCodeTtlMinutes');
      const user = await this.userService.findByPhoneNumberOrCreate(queryRunner, body);

      await queryRunner.manager.save(
        this.authCodeRepository.create({
          code: authCode,
          userId: user.id,
          expireAt: DateTime.now().plus({ minutes: authCodeValidMinutes }).toJSDate(),
          phoneNumber: user.phoneNumber,
          ip: body.ip,
          userAgent: body.headers?.['user-agent'] || null,
        }),
      );
      await this.messageService.createAuthCodes(queryRunner, authCode, user);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async verifyAuthCode(body: VerifyAuthCodeDto): Promise<VerifyAuthCodeResponseDto> {
    const user = await this.userService.findByPhoneNumber(body.phoneNumber);
    const authCode = await this.findAuthCode(user.id, body.phoneNumber, body.authCode);

    if (!authCode) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.useAuthCode(authCode.id);

    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user, body);
    const hasToCompleteProfile = user.email === null || user.name === null;

    return {
      tokens: {
        accessToken,
        refreshToken: refreshToken.token,
      },
      user,
      hasToCompleteProfile,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.userRefreshTokenService.deleteByToken(refreshToken);
  }

  private async createAccessToken(user: User): Promise<string> {
    const payload: AccessTokenInterface = {
      name: user.name,
      email: user.email,
      uuid: user.uuid,
      phoneNumber: user.phoneNumber,
    };

    return this.jwtService.signAsync(payload);
  }

  private async createRefreshToken(
    user: User,
    params: RefreshTokensDto | VerifyAuthCodeDto,
  ): Promise<UserRefreshToken> {
    return this.userRefreshTokenService.create(user, params);
  }

  async refreshTokens(params: RefreshTokensDto): Promise<TokensResponseDto> {
    const oldRefreshToken = await this.userRefreshTokenService.findOneBy({ token: params.refreshToken });

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.userRefreshTokenService.deleteByToken(params.refreshToken);
    const user = await this.userService.findById(oldRefreshToken.userId);

    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user, params);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async findAuthCode(userId: number, phoneNumber: string, authCode: number): Promise<AuthCode> {
    return this.authCodeRepository.findAuthCode(userId, phoneNumber, authCode);
  }

  async useAuthCode(id: number): Promise<void> {
    await this.authCodeRepository.update({ id }, { usedAt: DateTime.now().toJSDate() });
  }
}
