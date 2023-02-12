import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { RequestToBodyInterceptor } from '@app/common/interceptors/request-to-body.interceptor';
import { Locale } from '@app/translation/translation.types';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@web/auth/decorators/public.decorator';
import { Request } from 'express';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { WebhookDto } from './dto/webhook.dto';
import { PaymentService } from './payment.service';
import { CreatePaymentResponse } from './payment.types';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ description: `Create a payment paywall for an order` })
  @ApiResponse(ApiResponseHelper.success(CreatePaymentResponse))
  @ApiResponse(ApiResponseHelper.validationErrors(['Order not found']))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('user', 'user'))
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreatePaymentDto, @I18n() i18n: I18nContext): Promise<any> {
    return this.paymentService.create(body, i18n.lang as Locale);
  }

  @ApiOperation({ description: `Webhook to handle payment notification` })
  @ApiResponse(ApiResponseHelper.success(''))
  @ApiResponse(ApiResponseHelper.validationErrors(['Wrong signature']))
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('webhook/:paymentProviderType')
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Param() params: WebhookDto): Promise<any> {
    return this.paymentService.handleWebhook(req, params.paymentProviderType);
  }
}
