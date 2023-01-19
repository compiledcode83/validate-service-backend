import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { EventExistsValidator } from '@api/ticket-type/validators/event-exists.validator';
import { Allow, IsString, IsUUID, MinLength, Validate } from 'class-validator';
import { EventDuplicateValidator } from '../validators/event-duplicate.validator';
import { EventDto } from './event.dto';

export class UpdateEventDto extends EventDto {
  @ApiProperty({
    example: 'John Doe Concert',
    required: true,
    description: 'Name of the event',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  @Validate(EventDuplicateValidator)
  name: string;

  @IsUUID()
  @Validate(EventExistsValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
