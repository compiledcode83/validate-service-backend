import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { Allow, IsString, IsUUID, MaxLength, MinLength, Validate } from 'class-validator';
import { TicketTypeDuplicateValidator } from '../validators/ticket-type-duplicate.validator';
import { TicketTypeExistsValidator } from '../validators/ticket-type-exists.validator';
import { TicketTypeDto } from './ticket-type.dto';

export class UpdateTicketTypeDto extends TicketTypeDto {
  @ApiProperty({
    example: 'VIP ticket',
    required: true,
    minimum: 1,
    maximum: 255,
    description: 'Name of the ticket type',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Validate(TicketTypeDuplicateValidator)
  name: string;

  @IsUUID()
  @Validate(TicketTypeExistsValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
