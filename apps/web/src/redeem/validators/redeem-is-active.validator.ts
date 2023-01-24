import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { QrService } from '../qr.service';

@ValidatorConstraint({ name: 'redeemIsActive', async: true })
export class RedeemIsActiveValidator implements ValidatorConstraintInterface {
  constructor(private readonly qrService: QrService) {}

  async validate(redeemUuid: string): Promise<boolean> {
    return this.qrService.checkRedeemDisplayKeyExists(redeemUuid);
  }

  defaultMessage() {
    return 'The redeem is not active or has expired';
  }
}
