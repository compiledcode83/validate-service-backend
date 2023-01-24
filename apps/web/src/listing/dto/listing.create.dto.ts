import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumberString, IsUUID, MaxDate, MinDate, Validate } from 'class-validator';
import { TicketExistsValidator } from '@web/ticket/validator/ticket-exists-validator';
import { TicketIsInRedeemingProcess } from '@web/redeem/validators/ticket-is-in-redeeming-process.validator';
import { DateTime } from 'luxon';
import { IsNumberStringInRange } from '@app/common/validators/is-number-string-in-range';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { ListingStatus } from '@app/listing/listing.types';

export class ListingCreateValidateDto {
  @ApiProperty({ example: 1, required: true, description: 'Ticket UUID' })
  @IsUUID()
  @Validate(TicketExistsValidator)
  @Validate(TicketIsInRedeemingProcess)
  ticketUuid: string;

  @ApiProperty({ example: '50.34', required: true, description: 'Listing ticket price' })
  @IsNotEmpty()
  @IsNumberString()
  @IsNumberStringInRange(
    { min: 0.01, max: 100000 },
    { message: 'buyNowPrice must be a number string and should be in between 0.01 to 100000' },
  )
  buyNowPrice: string;

  @ApiProperty({
    example: CurrencyEnum.USD,
    required: true,
    enum: CurrencyEnum,
    description: 'Currency to deal in',
  })
  @IsNotEmpty()
  @IsEnum(CurrencyEnum)
  buyNowCurrency: CurrencyEnum;

  @ApiProperty({ description: 'Listing ticket ending date', example: '2022-08-29T11:51:37.889Z', required: true })
  @IsNotEmpty()
  @Type(() => Date)
  @MinDate(DateTime.now().plus({ days: 1 }).toJSDate())
  @MaxDate(DateTime.now().plus({ days: 60 }).toJSDate())
  @IsDate()
  endsAt: Date;

  @ApiProperty({ description: 'Market Type', example: 'secondary', required: true })
  @IsNotEmpty()
  marketType: string;

  @ApiProperty({ description: 'List Status', example: ListingStatus.Active, enum: ListingStatus })
  @IsNotEmpty()
  @IsEnum(ListingStatus)
  status: ListingStatus;
}
