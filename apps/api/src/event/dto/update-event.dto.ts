import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { EventExistsValidator } from '@api/ticket-type/validators/event-exists.validator';
import { Allow, IsOptional, IsString, IsUUID, MaxLength, MinLength, Validate } from 'class-validator';
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
  name: string;

  @ApiProperty({
    description: 'Short description of the event',
    example: 'Lorem ipsum',
    maximum: 512,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  shortDescription: string;

  @ApiProperty({
    description: 'Long description of the event',
    example: 'Lorem ipsum',
    maximum: 10000,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  longDescription: string;

  @ApiProperty({
    description: 'Event location name',
    example: 'Lorem ipsum',
    maximum: 512,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  locationName: string;

  @ApiProperty({
    description: 'Event location URL',
    example: 'Lorem ipsum',
    maximum: 255,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  locationUrl: string;

  @IsUUID()
  @Validate(EventExistsValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
