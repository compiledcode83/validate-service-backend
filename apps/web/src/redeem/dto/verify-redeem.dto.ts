import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Validate } from 'class-validator';
import { RedeemCodeValidator } from '../validators/redeem-code.validator';

export class VerifyRedeemDto {
  @ApiProperty({ example: 123456, required: true })
  @Type(() => Number)
  @IsInt()
  code: number;

  @Validate(RedeemCodeValidator)
  redeemUuid: string;
}
