import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';
import { TicketService } from '../ticket.service';
import { TicketStatus } from '../ticket.types';

@ValidatorConstraint({ name: 'ticketIsValidatableValidator', async: true })
export class TicketIsValidatableValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketService: TicketService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as ValidateTicketDto;
    const ticket = await this.ticketService.findByUuidAndProvider(uuid, ticketProvider.id);

    return ticket && ticket.status === TicketStatus.Active;
  }

  defaultMessage() {
    return 'Ticket is already used or not created yet';
  }
}
