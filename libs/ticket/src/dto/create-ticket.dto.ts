import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Allow, IsInt, IsOptional, IsUrl, MaxLength, Validate, ValidateNested } from 'class-validator';
import { CreateTicketEventDto } from './create-ticket-event.dto';
import { CreateTicketTypeDto } from './create-ticket-type.dto';
import { CreateTicketUserDto } from './create-ticket-user.dto';

export class CreateTicketDto {
  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Validate(TicketProviderExistsValidator)
  ticketProviderId: number;

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
  @Type(() => CreateTicketTypeDto)
  @ValidateNested()
  ticketType: CreateTicketTypeDto;

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

  @Allow()
  ticketProvider: TicketProvider;
}
