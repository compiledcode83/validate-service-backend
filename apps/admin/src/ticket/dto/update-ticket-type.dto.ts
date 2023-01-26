import { ApiProperty } from '@nestjs/swagger';
import { TicketTypeDuplicateValidator } from '@admin/ticket-type/validators/ticket-type-duplicate.validator';
import { Type } from 'class-transformer';
import { Validate, IsOptional, IsInt, IsNotEmpty, MinLength, IsString, MaxLength, Min } from 'class-validator';
import { DateValidator } from '@app/common/validators/date.validator';

export class UpdateTicketTicketTypeDto {
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
  @Validate(TicketTypeDuplicateValidator)
  name: string;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Sale Start date',
  })
  @Validate(DateValidator)
  @IsOptional()
  resaleEnabledFromDate?: Date;

  @ApiProperty({
    example: '2025-06-23',
    required: true,
    description: 'Sale end date',
  })
  @Validate(DateValidator)
  @IsOptional()
  resaleEnabledToDate?: Date;

  @ApiProperty({ example: 'Ticket Sale Amount', minimum: 1, description: 'Ticket Sale Amount' })
  @IsOptional()
  @Type(() => Number)
  @Min(0.02)
  resaleMinPrice: string;

  @ApiProperty({ example: 'Ticket Sale Amount', minimum: 1, description: 'Ticket Sale Amount' })
  @IsOptional()
  @Type(() => Number)
  @Min(0.02)
  resaleMaxPrice: string;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  ticketProviderId: number;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  ticketTypeId: number;
}
