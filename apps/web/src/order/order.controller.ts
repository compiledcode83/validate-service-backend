import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { RequestToBodyInterceptor } from '@app/common/interceptors/request-to-body.interceptor';
import { Order } from '@app/order/order.entity';
import { Locale } from '@app/translation/translation.types';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthRequest } from '@web/auth/auth.types';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ description: `Create a new order on primary market` })
  @ApiResponse(ApiResponseHelper.success(Order))
  @ApiResponse(ApiResponseHelper.validationErrors(['One or more tickets are unavailable']))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('user', 'user'))
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateOrderDto, @I18n() i18n: I18nContext): Promise<any> {
    return this.orderService.create(body, i18n.lang as Locale);
  }

  @ApiOperation({ description: `Get order information` })
  @ApiResponse(ApiResponseHelper.success(Order))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async findOne(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Req() req: AuthRequest,
    @I18n() i18n: I18nContext,
  ): Promise<Order> {
    const order = await this.orderService.findByUuidAndUser(uuid, req.user.id, i18n.lang as Locale);

    if (!order) {
      throw new NotFoundException();
    }

    return order;
  }
}
