import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '@app/user/user.entity';
import { CursorFilterDto } from '@app/common/pagination/cursor-filter.dto';
import { Ticket } from '@app/ticket/ticket.entity';

export class FindUserTicketsDto extends CursorFilterDto {
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

  @Allow()
  user: User;
}
