import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Type } from 'class-transformer';
import { Allow, IsObject, IsOptional, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { TicketAdditionalData } from '../ticket.types';
import { CreateTicketEventDto } from './create-ticket-event.dto';
import { CreateTicketTicketTypeDto } from './create-ticket-ticket-type.dto';
import { CreateTicketUserDto } from './create-ticket-user.dto';

export class CreateTicketDto {
  @ApiProperty({
    example: { name: 'John doe', phoneNumber: '+17951110000', email: 'user@example.com' },
    required: true,
    description: `Create new user with the ticket`,
  })
  @Type(() => CreateTicketUserDto)
  @ValidateNested()
  user: CreateTicketUserDto;

  @ApiProperty({
    example: { name: 'John doe concert' },
    required: true,
    description: `Event name of the ticket. Will be automatically created if doesn't exist yet`,
  })
  @Type(() => CreateTicketEventDto)
  @ValidateNested()
  event: CreateTicketEventDto;

  @ApiProperty({
    example: { name: 'John doe concert' },
    required: true,
    description: `Ticket type of the ticket. Will be automatically created if doesn't exist yet`,
  })
  @Type(() => CreateTicketTicketTypeDto)
  @ValidateNested()
  ticketType: CreateTicketTicketTypeDto;

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
