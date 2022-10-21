import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Allow, IsObject, IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength, Validate } from 'class-validator';
import { TicketAdditionalData } from '../ticket.types';
import { TicketUserExistsAndActiveValidator } from '../validators/ticket-user-exists-validator';

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
    example: { eventName: 'Museum', ticketType: 'Adult', ticketPrice: '250 AED', date: '22-05-2025' },
    required: false,
    description: 'Any additional ticket data in key value pairs',
  })
  @IsOptional()
  @IsObject()
  additionalData: TicketAdditionalData;

  @Allow()
  ticketProvider: TicketProvider;
}
