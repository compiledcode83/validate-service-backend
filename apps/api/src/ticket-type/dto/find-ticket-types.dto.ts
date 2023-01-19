import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsIn, IsInt, IsOptional, IsUUID, Max, Min, Validate } from 'class-validator';
import { CursorFilterDto } from '@api/common/pagination/cursor-filter.dto';
import { Type } from 'class-transformer';
import { EventExistsValidator } from '../validators/event-exists.validator';
import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { TicketType } from '../ticket-type.entity';

export class FindTicketTypesDto extends CursorFilterDto {
  @ApiProperty({
    example: '5e9d96f9-7103-4b8b-b3c6-c37608e38305',
    required: true,
    description: `Event uuid`,
  })
  @IsUUID()
  @Validate(EventExistsValidator)
  eventUuid: string;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt'], required: false })
  @IsOptional()
  @IsIn(['createdAt'])
  orderParam: keyof TicketType = 'createdAt';

  @ApiProperty({ example: 10, minimum: 1, maximum: 50, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 50;

  @Allow()
  ticketProvider: TicketProvider;
}
