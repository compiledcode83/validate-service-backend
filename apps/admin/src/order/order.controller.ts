import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthRequest } from '@admin/auth/auth.types';
import { OrderService } from './order.service';
import { FindOrdersDto } from './dto/find-orders.dto';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { Order } from '@app/order/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ description: `Get order information` })
  @ApiResponse(ApiResponseHelper.success(Order))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string, @Req() req: AuthRequest): Promise<Order> {
    const order = await this.orderService.findByUuidAndUser(uuid, req.user.id);

    if (!order) {
      throw new NotFoundException();
    }

    return order;
  }

  @ApiOperation({ description: `Get order information` })
  @ApiResponse(ApiResponseHelper.success(Order))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindOrdersDto) {
    return this.orderService.findAllPaginated(searchParams);
  }
}
