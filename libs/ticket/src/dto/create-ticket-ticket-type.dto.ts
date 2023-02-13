import { DateValidator } from '@app/common/validators/date.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, Min, MinLength, Validate } from 'class-validator';

export class CreateTicketTicketTypeDto {
  @ApiProperty({
    example: '25edb6e5-499d-4194-b858-beb1ad6d9c41',
    required: true,
    description: 'ID of the ticket type',
    minLength: 1,
    maxLength: 36,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  uuid: string;

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
  ticketDateStart: Date;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Ticket end date',
  })
  @Validate(DateValidator)
  @IsOptional()
  ticketDateEnd?: Date;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Sale Start date',
  })
  @Validate(DateValidator)
  @IsOptional()
  saleEnabledFromDate?: Date;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Sale end date',
  })
  @Validate(DateValidator)
  @IsOptional()
  saleEnabledToDate?: Date;

  @ApiProperty({ example: 'Ticket Sale Amount', minimum: 1, description: 'Ticket Sale Amount' })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  saleAmount: number;
}
