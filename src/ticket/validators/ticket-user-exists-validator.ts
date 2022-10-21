import { CreateTicketTransferDto } from '@src/ticket-transfer/dto/create-ticket-transfer.dto';
import { UserService } from '@src/user/user.service';
import { UserStatus } from '@src/user/user.types';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateTicketDto } from '../dto/create-ticket.dto';

@ValidatorConstraint({ name: 'ticketUserExistsAndActiveValidator', async: true })
export class TicketUserExistsAndActiveValidator implements ValidatorConstraintInterface {
  private errorMessage: string;

  constructor(private readonly userService: UserService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as CreateTicketDto | CreateTicketTransferDto;
    const user = await this.userService.findByUuidAndProvider(uuid, ticketProvider.id);

    if (!user) {
      this.errorMessage = 'User not found';

      return false;
    }

    if (user.status !== UserStatus.Active) {
      this.errorMessage = 'User is not yet active';

      return false;
    }

    return true;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
