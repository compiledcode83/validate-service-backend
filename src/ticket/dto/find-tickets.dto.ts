import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { CursorFilterDto } from '@src/common/pagination/cursor-filter.dto';
import { Ticket } from '../ticket.entity';
import { Type } from 'class-transformer';
import { TicketStatus } from '../ticket.types';

export class FindTicketsDto extends CursorFilterDto {
  @ApiProperty({ example: '8e9c3708-25d8-467f-9a68-00507f8ece4a', required: false })
  @IsOptional()
  @IsUUID()
  userUuid: string;

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
