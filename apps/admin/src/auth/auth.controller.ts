import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from '@admin/auth/auth.service';
import { LocalAuthGuard } from '@admin/auth/guards/local-auth.guard';
import { Response } from 'express';
import { AuthRequest } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { Public } from './decorators/public.decorator';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { RequestToBodyInterceptor } from '@app/common/interceptors/request-to-body.interceptor';
import { CookieToBodyInterceptor } from '@app/common/interceptors/cookie-to-body.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  @ApiResponse(ApiResponseHelper.success(TokensResponseDto, HttpStatus.OK))
  @Public()
  @UseInterceptors(new RequestToBodyInterceptor('headers', 'headers'), new RequestToBodyInterceptor('ip', 'ip'))
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('login')
  async login(@Req() req: AuthRequest, @Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const authData = await this.authService.login(req.admin, body);

    res.cookie('refreshToken', authData.refreshToken, {
      httpOnly: this.configService.get('jwtConfig.refreshTokenCookieHttpOnly'),
      secure: this.configService.get('jwtConfig.refreshTokenCookieSecure'),
      maxAge: this.configService.get('jwtConfig.refreshTokenDurationDays') * 1000 * 60 * 60 * 24,
      domain: this.configService.get('jwtConfig.refreshTokenCookieDomain'),
    });

    return { accessToken: authData.accessToken };
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
  async refreshTokens(@Body() params: RefreshTokensDto, @Res({ passthrough: true }) res: Response): Promise<any> {
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
