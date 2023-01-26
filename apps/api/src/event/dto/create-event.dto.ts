import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Allow, IsString, MinLength, Validate } from 'class-validator';
import { EventDuplicateValidator } from '../validators/event-duplicate.validator';
import { EventDto } from './event.dto';

export class CreateEventDto extends EventDto {
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

  @Allow()
  ticketProvider: TicketProvider;
}
