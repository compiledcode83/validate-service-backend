import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { VerifyRedeemDto } from '../dto/verify-redeem.dto';
import { RedeemService } from '../redeem.service';

@ValidatorConstraint({ name: 'redeemCodeValidator', async: true })
export class RedeemCodeValidator implements ValidatorConstraintInterface {
  private errorMessage = 'The redeem code is not valid or redeem is already verified';

  constructor(private readonly redeemService: RedeemService) {}

  async validate(redeemUuid: string, args: ValidationArguments): Promise<boolean> {
    const { code } = args.object as VerifyRedeemDto;

    if (!code) {
      return false;
    }

    const redeem = await this.redeemService.findForVerify(redeemUuid, code);

    return redeem !== null;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
