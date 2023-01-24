import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { TicketStatus } from '@app/ticket/ticket.types';
import { Ticket } from '@app/ticket/ticket.entity';

export class FindTicketsDto extends CursorFilterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  purchaseId: string;

  @ApiProperty({ example: TicketStatus.Active, enum: TicketStatus, required: false })
  @IsOptional()
  @IsEnum(TicketStatus)
  status: TicketStatus = TicketStatus.Active;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt', 'status'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof Ticket = 'createdAt';

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 50;
}
