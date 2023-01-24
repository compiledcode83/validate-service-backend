import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PublicKeyResponse } from './app.types';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService, private readonly appService: AppService) {}

  @ApiResponse(ApiResponseHelper.success(PublicKeyResponse))
  @Public()
  @Get('public-key')
  async getPublicKey(): Promise<PublicKeyResponse> {
    const key = this.configService.getOrThrow('appConfig.publicKey');

    return { key };
  }

  @Public()
  @Get('health-check')
  async healthCheck(): Promise<void> {
    await this.appService.healthCheck();
  }
}
