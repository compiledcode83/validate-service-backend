import { ApiProperty } from '@nestjs/swagger';
import { DateValidator } from '@src/common/validators/date.validator';
import { IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator';

export class CreateTicketTicketTypeDto {
  @ApiProperty({ example: 'VIP ticket', required: true, minimum: 1, maximum: 128, description: 'Ticket type name' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Ticket start date',
  })
  @Validate(DateValidator)
  ticketDateStart: string;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Ticket end date',
  })
  @Validate(DateValidator)
  @IsOptional()
  ticketDateEnd?: string;
}
