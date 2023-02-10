import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { TicketAdditionalData } from '@app/ticket/ticket.types';
import { CreateTicketDto as CommonCreateTicketDto } from '@app/ticket/dto/create-ticket.dto';

export class CreateTicketDto extends CommonCreateTicketDto {
  @ApiProperty({
    example: { ticketPrice: '250 AED', comment: 'No pets allowed' },
    required: false,
    description: 'Any additional ticket data in key value pairs',
  })
  @IsOptional()
  @IsObject()
  additionalData: TicketAdditionalData;
}
