import { OrderMarketType } from '@app/order/order.types';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@app/user/user.entity';
import { Type } from 'class-transformer';
import { Allow, ArrayMaxSize, ArrayMinSize, IsEnum, IsUUID, ValidateIf, ValidateNested } from 'class-validator';
import { TicketTypeDto } from './ticket-type.dto';

export class CreateOrderDto {
  @ApiProperty({ example: OrderMarketType.Primary, enum: OrderMarketType, required: true })
  @IsEnum(OrderMarketType)
  marketType: OrderMarketType;

  @ApiProperty({
    example: [{ ticketTypeUuid: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000', quantity: 2 }],
    required: false,
    description: 'Required for primary market sale',
  })
  @ValidateIf((o) => o.marketType === OrderMarketType.Primary)
  @Type(() => TicketTypeDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  ticketTypes: TicketTypeDto[];

  @ApiProperty({
    example: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
    required: false,
    description: 'Required for secondary market sale',
  })
  @ValidateIf((o) => o.marketType === OrderMarketType.Secondary)
  @IsUUID()
  listingUuid: string;

  @Allow()
  user: User;
}
