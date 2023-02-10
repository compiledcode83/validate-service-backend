import { DateValidator } from '@app/common/validators/date.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength, Validate, ValidateIf } from 'class-validator';

export class CreateTicketTypeDto {
  @ApiProperty({
    example: '8e9c3708-25d8-467f-9a68-00507f8ece4a',
    required: true,
    description: 'Uuid of TicketType',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  ticketTypeUuid: string;

  @ApiProperty({ example: 'VIP ticket', required: true, minimum: 1, maximum: 128, description: 'Ticket type name' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  @IsOptional()
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
