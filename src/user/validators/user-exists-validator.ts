import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../user.service';

@ValidatorConstraint({ name: 'userExistsValidator', async: true })
export class UserExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as UpdateUserDto;
    const user = await this.userService.findByUuidAndProvider(uuid, ticketProvider.id);

    return Boolean(user);
  }

  defaultMessage() {
    return 'User not found';
  }
}
