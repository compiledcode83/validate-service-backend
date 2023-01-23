import { CurrencyEnum } from '@app/common/types/currency.enum';
import { DateValidator } from '@app/common/validators/date.validator';
import { TicketTypeResaleStatus, TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsNumber, IsOptional, Max, Min, Validate, ValidateIf } from 'class-validator';

export class TicketTypeDto {
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

  @ApiProperty({
    example: 1,
    required: true,
    description: 'Sale enabled',
  })
  @IsOptional()
  @IsIn([TicketTypeSaleStatus.Enabled, TicketTypeSaleStatus.Disabled])
  saleEnabled: number;

  @ApiProperty({
    required: false,
    description: 'Sale enabled from date',
  })
  @ValidateIf((o) => o.saleEnabled === TicketTypeSaleStatus.Enabled)
  @IsDateString()
  saleEnabledFromDate: Date;

  @ApiProperty({
    required: false,
    description: 'Sale enabled to date',
  })
  @ValidateIf((o) => o.saleEnabled === TicketTypeSaleStatus.Enabled)
  @IsDateString()
  saleEnabledToDate: Date;

  @ApiProperty({
    required: false,
    description: 'Amount of tickets for sale',
  })
  @ValidateIf((o) => o.saleEnabled === TicketTypeSaleStatus.Enabled)
  @Min(1)
  @Max(1000000)
  saleAmount: number;

  @ApiProperty({ example: 50.0, required: false, description: 'Sale price' })
  @ValidateIf((o) => o.saleEnabled === TicketTypeResaleStatus.Enabled)
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  salePrice: string;

  @ApiProperty({ example: CurrencyEnum, required: false, description: 'Sale currency' })
  @ValidateIf((o) => o.saleEnabled === TicketTypeResaleStatus.Enabled)
  @IsEnum(CurrencyEnum)
  saleCurrency: CurrencyEnum;

  @ApiProperty({
    example: 1,
    required: true,
    description: 'Resale enabled',
  })
  @IsOptional()
  @IsIn([TicketTypeResaleStatus.Enabled, TicketTypeResaleStatus.Disabled])
  resaleEnabled: number;

  @ApiProperty({
    required: false,
    description: 'Resale enabled from date',
  })
  @ValidateIf((o) => o.resaleEnabled === TicketTypeResaleStatus.Enabled)
  @IsDateString()
  resaleEnabledFromDate: Date;

  @ApiProperty({
    required: false,
    description: 'Resale enabled to date',
  })
  @ValidateIf((o) => o.resaleEnabled === TicketTypeResaleStatus.Enabled)
  @IsDateString()
  resaleEnabledToDate: Date;

  @ApiProperty({ example: 50.0, required: false, description: 'Resale min price' })
  @ValidateIf((o) => o.resaleEnabled === TicketTypeResaleStatus.Enabled)
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  resaleMinPrice: string;

  @ApiProperty({ example: 50.0, required: false, description: 'Resale max price' })
  @ValidateIf((o) => o.resaleEnabled === TicketTypeResaleStatus.Enabled)
  @Type(() => Number)
  @IsNumber()
  @Min(0.02)
  resaleMaxPrice: string;

  @ApiProperty({ example: CurrencyEnum, required: false, description: 'Resale currency' })
  @ValidateIf((o) => o.resaleEnabled === TicketTypeResaleStatus.Enabled)
  @IsEnum(CurrencyEnum)
  resaleCurrency: CurrencyEnum;
}
