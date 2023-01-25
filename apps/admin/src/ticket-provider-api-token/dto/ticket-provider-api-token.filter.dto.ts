import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { TicketProviderApiToken } from '../ticket-provider-api-token.entity';
import { Type } from 'class-transformer';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';

export class TicketProviderApiTokenFilterDto extends CursorFilterDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ticketProviderId: number;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof TicketProviderApiToken = 'createdAt';
}
