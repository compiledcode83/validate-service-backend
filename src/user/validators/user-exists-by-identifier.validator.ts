import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../user.service';

@ValidatorConstraint({ name: 'userExistsByIdentifierValidator', async: true })
export class UserExistsByIdentifierValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(emailOrPhoneNumber: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as CreateUserDto | UpdateUserDto;

    if (args.property !== ticketProvider.userIdentifier) {
      return true;
    }

    const userExists = await this.userService.findByIdentifierAndProvider(
      ticketProvider.userIdentifier,
      emailOrPhoneNumber,
      ticketProvider.id,
    );

    return !Boolean(userExists);
  }

  defaultMessage(args: ValidationArguments) {
    return `User with identifier '${args.value}' already exists`;
  }
}
