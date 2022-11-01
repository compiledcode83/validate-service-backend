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
import { RequestToBodyInterceptor } from '@src/common/interceptors/request-to-body.interceptor';
import { CookieToBodyInterceptor } from '@src/common/interceptors/cookie-to-body.interceptor';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseHelper } from '@src/common/helpers/api-response.helper';
import { ConfigService } from '@nestjs/config';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  @ApiResponse(ApiResponseHelper.success(TokensResponseDto, HttpStatus.OK))
  @Public()
  @UseInterceptors(new RequestToBodyInterceptor('headers', 'headers'), new RequestToBodyInterceptor('ip', 'ip'))
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('login')
  async login(@Req() req: AuthRequest, @Body() body: LoginDto) {
    return this.authService.login(req.ticketProvider, body);
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
    @Req() req: GuestRequest,
    @Body() params: RefreshTokensDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const authData = await this.authService.refreshTokens(params);

    res.cookie('refreshToken', authData.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: this.configService.get('jwtConfig.refreshTokenDurationDays') * 1000 * 60 * 60 * 24,
      domain: this.configService.get('jwtConfig.refreshTokenCookieDomain'),
    });

    return { accessToken: authData.accessToken };
  }

  @ApiResponse(ApiResponseHelper.successWithExample({}, HttpStatus.OK))
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: AuthRequest, @Body() params: LogoutDto): Promise<void> {
    const { refreshToken } = req.cookies || {};

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing');
    }

    return this.authService.logout(params);
  }
}
