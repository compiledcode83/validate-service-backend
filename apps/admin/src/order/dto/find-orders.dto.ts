import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ValidateHelper } from '@app/common/helpers/validate-helper';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { Order } from '@app/order/order.entity';
import { OrderMarketType, OrderPaymentStatus, OrderStatus } from '@app/order/order.types';

export class FindOrdersDto extends CursorFilterDto {
  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof Order = 'createdAt';

  @ApiProperty({ example: 'platinum', required: false })
  @Transform(({ value }) => ValidateHelper.sanitize(value))
  @IsOptional()
  @IsString()
  buyerInputValue: string;

  @ApiProperty({ example: 'cs_test', required: false })
  @IsOptional()
  @IsString()
  paymentExternalId: string;

  @ApiProperty({ example: 'primary', enum: OrderMarketType, required: false })
  @IsEnum(OrderMarketType)
  @IsOptional()
  marketType: OrderMarketType;

  @ApiProperty({ example: 'paid', enum: OrderStatus, required: false })
  @Type(() => String)
  @IsString()
  @IsOptional()
  orderStatus: OrderStatus;

  @ApiProperty({ example: 'completed', enum: OrderPaymentStatus, required: false })
  @Type(() => String)
  @IsString()
  @IsOptional()
  paymentStatus: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 50;

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  ticketProviderId: number;
}
