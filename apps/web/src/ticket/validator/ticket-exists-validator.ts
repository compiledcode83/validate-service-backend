import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TicketValidator } from '../ticket.validator';

@ValidatorConstraint({ name: 'ticketExistsValidator', async: true })
export class TicketExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketValidator: TicketValidator) {}

  async validate(ticketUuid: string) {
    return this.ticketValidator.isTicketValid(ticketUuid);
  }

  defaultMessage() {
    return `ticket is not valid.`;
  }
}
