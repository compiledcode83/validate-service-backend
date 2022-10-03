import { CreateTicketTransferDto } from '@src/ticket-transfer/dto/create-ticket-transfer.dto';
import { UserService } from '@src/user/user.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateTicketDto } from '../dto/create-ticket.dto';

@ValidatorConstraint({ name: 'ticketUserExistsValidator', async: true })
export class TicketUserExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as CreateTicketDto | CreateTicketTransferDto;
    const user = await this.userService.findByUuidAndProvider(uuid, ticketProvider.id);

    return Boolean(user);
  }

  defaultMessage() {
    return 'User not found';
  }
}
