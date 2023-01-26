import { UserService } from '@web/user/user.service';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'userExistsByPhoneNumberValidator', async: true })
export class UserExistsByPhoneNumberValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(phoneNumber: string): Promise<boolean> {
    const user = await this.userService.findByPhoneNumber(phoneNumber);

    return Boolean(user);
  }

  defaultMessage() {
    return 'User not found';
  }
}
