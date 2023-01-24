import { RedeemMode } from '@app/redeem/redeem.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { AtLeastOneTicketRedeemableValidator } from '../validators/at-least-one-ticket-redeemable.validator';

export class CreateRedeemDto {
  @ApiProperty({ example: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000', required: true, maxLength: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Validate(AtLeastOneTicketRedeemableValidator)
  purchaseId: string;

  @ApiProperty({ example: RedeemMode.Individual, required: true, enum: RedeemMode, description: 'Redeem mode' })
  @IsEnum(RedeemMode)
  mode: RedeemMode;
}
