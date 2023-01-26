import { Validate } from 'class-validator';
import { RedeemIsActiveValidator } from '../validators/redeem-is-active.validator';

export class ShowRedeemQrDto {
  @Validate(RedeemIsActiveValidator)
  redeemUuid: string;
}
