import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Allow, IsOptional, IsString, IsUUID, MaxLength, MinLength, Validate } from 'class-validator';
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
  name: string;

  @ApiProperty({
    example: 'Awesome experience',
    required: false,
    minimum: 1,
    maximum: 1000,
    description: 'Description of the ticket type',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1000)
  description: string;

  @IsUUID()
  @Validate(TicketTypeExistsValidator)
  uuid: string;

  @Allow()
  ticketProvider: TicketProvider;
}
