import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateRedeemDto } from './dto/create-redeem.dto';
import { RedeemService } from './redeem.service';
import { VerifyRedeemDto } from './dto/verify-redeem.dto';
import { ShowRedeemQrDto } from './dto/show-redeem-qr.dto';
import { Public } from '@web/auth/decorators/public.decorator';
import { ShowRedeemQrResponseDto } from './dto/show-redeem-qr-response.dto';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { Redeem } from '@app/redeem/redeem.entity';
import { ParamToBodyInterceptor } from '@app/common/interceptors/param-to-body.interceptor';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Locale } from '@app/translation/translation.types';

@Controller('redeem')
export class RedeemController {
  constructor(private readonly redeemService: RedeemService) {}

  @ApiOperation({ description: `Create ticket redeem` })
  @ApiResponse(ApiResponseHelper.success(Redeem))
  @ApiResponse(ApiResponseHelper.validationErrors(['Ticket is already being redeemed']))
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() body: CreateRedeemDto, @Req() req: Request): Promise<Redeem> {
    return this.redeemService.create(body, req);
  }

  @ApiOperation({ description: `Verify ticket redeem` })
  @ApiResponse(ApiResponseHelper.success(Redeem))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @Public()
  @UseInterceptors(ClassSerializerInterceptor, new ParamToBodyInterceptor('uuid', 'redeemUuid'))
  @HttpCode(HttpStatus.OK)
  @Post(':uuid/verify')
  async verify(@Body() body: VerifyRedeemDto): Promise<Redeem> {
    return this.redeemService.verify(body);
  }

  @ApiOperation({ description: `Get QR code data for redeem` })
  @ApiResponse(ApiResponseHelper.success([ShowRedeemQrResponseDto]))
  @ApiResponse(ApiResponseHelper.validationErrors(['The redeem is not active or has expired']))
  @Public()
  @UseInterceptors(ClassSerializerInterceptor, new ParamToBodyInterceptor('uuid', 'redeemUuid'))
  @HttpCode(HttpStatus.OK)
  @Post(':uuid/qr')
  async getQr(@Body() body: ShowRedeemQrDto, @I18n() i18n: I18nContext): Promise<ShowRedeemQrResponseDto[]> {
    return this.redeemService.getRedeemQrCodes(body.redeemUuid, i18n.lang as Locale);
  }
}
