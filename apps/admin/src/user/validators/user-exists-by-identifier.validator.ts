import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UserValidator } from '../user.validator';

@ValidatorConstraint({ name: 'UserExistsValidatorByIdentifier', async: true })
export class UserExistsValidatorByIdentifier implements ValidatorConstraintInterface {
  constructor(private readonly userValidator: UserValidator) {}

  async validate(value: string) {
    return this.userValidator.isEmailOrPhonePresent(value);
  }

  defaultMessage() {
    return `User is not valid.`;
  }
}
