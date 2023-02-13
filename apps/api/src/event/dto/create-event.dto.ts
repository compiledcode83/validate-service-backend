import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Allow, IsString, MaxLength, MinLength, Validate } from 'class-validator';
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
  name: string;

  @ApiProperty({
    example: '25edb6e5-499d-4194-b858-beb1ad6d9c41',
    required: true,
    description: 'ID of the event',
    minLength: 1,
    maxLength: 36,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  @Validate(EventDuplicateValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
