import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from './auth.types';
import { Public } from './decorators/public.decorator';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { Response } from 'express';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SendAuthCodeDto } from './dto/send-auth-code.dto';
import { VerifyAuthCodeDto } from './dto/verify-auth-code.dto';
import { VerifyAuthCodeResponseDto } from './dto/verify-auth-code-response.dto';
import { ApiResponseHelper, CookieToBodyInterceptor, RequestToBodyInterceptor } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  @ApiResponse(ApiResponseHelper.success(TokensResponseDto, HttpStatus.OK))
  @Public()
  @UseInterceptors(new RequestToBodyInterceptor('headers', 'headers'), new RequestToBodyInterceptor('ip', 'ip'))
  @HttpCode(HttpStatus.CREATED)
  @Post('send-auth-code')
  async sendAuthCode(@Body() body: SendAuthCodeDto) {
    await this.authService.sendAuthCode(body);
  }

  @ApiResponse(ApiResponseHelper.success(VerifyAuthCodeResponseDto, HttpStatus.OK))
  @Public()
  @UseInterceptors(new RequestToBodyInterceptor('headers', 'headers'), new RequestToBodyInterceptor('ip', 'ip'))
  @HttpCode(HttpStatus.CREATED)
  @Post('verify-auth-code')
  async verifyAuthCode(
    @Body() body: VerifyAuthCodeDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyAuthCodeResponseDto> {
    const authData = await this.authService.verifyAuthCode(body);

    res.cookie('refreshToken', authData.tokens.refreshToken, {
      httpOnly: this.configService.get('jwtConfig.refreshTokenCookieHttpOnly'),
      secure: this.configService.get('jwtConfig.refreshTokenCookieSecure'),
      maxAge: this.configService.get('jwtConfig.refreshTokenDurationDays') * 1000 * 60 * 60 * 24,
      domain: this.configService.get('jwtConfig.refreshTokenCookieDomain'),
    });

    delete authData.tokens.refreshToken;

    return authData;
  }

  @ApiResponse(ApiResponseHelper.success(TokensResponseDto, HttpStatus.OK))
  @Public()
  @UseInterceptors(
    new RequestToBodyInterceptor('headers', 'headers'),
    new RequestToBodyInterceptor('ip', 'ip'),
    new CookieToBodyInterceptor('refreshToken', 'refreshToken'),
  )
  @HttpCode(HttpStatus.CREATED)
  @Post('refresh-tokens')
  async refreshTokens(
    @Body() params: RefreshTokensDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokensResponseDto> {
    const authData = await this.authService.refreshTokens(params);

    res.cookie('refreshToken', authData.refreshToken, {
      httpOnly: this.configService.get('jwtConfig.refreshTokenCookieHttpOnly'),
      secure: this.configService.get('jwtConfig.refreshTokenCookieSecure'),
      maxAge: this.configService.get('jwtConfig.refreshTokenDurationDays') * 1000 * 60 * 60 * 24,
      domain: this.configService.get('jwtConfig.refreshTokenCookieDomain'),
    });

    return { accessToken: authData.accessToken };
  }

  @ApiResponse(ApiResponseHelper.successWithExample({}, HttpStatus.OK))
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: AuthRequest): Promise<void> {
    const { refreshToken } = req.cookies || null;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing');
    }

    return this.authService.logout(String(refreshToken));
  }
}
