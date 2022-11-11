import { ApiProperty } from '@nestjs/swagger';
import { DateValidator } from '@src/common/validators/date.validator';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Allow, IsObject, IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength, Validate } from 'class-validator';
import { TicketAdditionalData } from '../ticket.types';
import { TicketUserExistsAndActiveValidator } from '../validators/ticket-user-exists-and-active.validator';

export class CreateTicketDto {
  @ApiProperty({
    example: '5e9d96f9-7103-4b8b-b3c6-c37608e38305',
    required: true,
    description: `Ticket user's uuid`,
  })
  @IsUUID()
  @Validate(TicketUserExistsAndActiveValidator)
  userUuid: string;

  @ApiProperty({
    example: 'Abu Dhabi Full-Day Trip with Louvre',
    required: true,
    minimum: 1,
    maximum: 255,
    description: 'Name of the ticket',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 'VIP ticket',
    required: true,
    minimum: 1,
    maximum: 64,
    description: 'Type of the ticket',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  type: string;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Ticket start date',
  })
  @Validate(DateValidator)
  dateStart: string;

  @ApiProperty({
    example: '2025-06-24',
    required: false,
    description: 'Ticket end date',
  })
  @IsOptional()
  @Validate(DateValidator)
  dateEnd?: string;

  @ApiProperty({
    example: 'https://example.com/tickets/images/1.jpg',
    required: false,
    maximum: 255,
    description: 'Ticket image URL',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  imageUrl: string;

  @ApiProperty({
    example: { ticketPrice: '250 AED', comment: 'No pets allowed' },
    required: false,
    description: 'Any additional ticket data in key value pairs',
  })
  @IsOptional()
  @IsObject()
  additionalData: TicketAdditionalData;

  @Allow()
  ticketProvider: TicketProvider;
}
