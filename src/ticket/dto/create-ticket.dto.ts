import { ApiProperty } from '@nestjs/swagger';
import { DateValidator } from '@src/common/validators/date.validator';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Type } from 'class-transformer';
import {
  Allow,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { TicketAdditionalData } from '../ticket.types';
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
