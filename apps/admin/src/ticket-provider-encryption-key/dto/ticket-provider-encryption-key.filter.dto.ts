import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { TicketProviderEncryptionKey } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.entity';

export class TicketProviderEncryptionKeyFilterDto extends CursorFilterDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ticketProviderId: number;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof TicketProviderEncryptionKey = 'createdAt';
}
