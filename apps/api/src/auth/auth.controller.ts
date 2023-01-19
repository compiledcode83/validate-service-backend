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
import { AuthService } from './auth.service';
import { AuthRequest, GuestRequest } from './auth.types';
import { Public } from './decorators/public.decorator';
import { RefreshTokensDto } from './dto/refresh-tokens.dto';
import { Response } from 'express';
import { RequestToBodyInterceptor } from '@api/common/interceptors/request-to-body.interceptor';
import { CookieToBodyInterceptor } from '@api/common/interceptors/cookie-to-body.interceptor';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseHelper } from '@api/common/helpers/api-response.helper';
import { ConfigService } from '@nestjs/config';

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
    const authData = await this.authService.login(req.ticketProvider, body);

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
