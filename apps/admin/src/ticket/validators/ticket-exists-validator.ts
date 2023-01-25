import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TicketValidator } from '../ticket.validator';

@ValidatorConstraint({ name: 'TicketExistsValidator', async: true })
export class TicketExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketValidator: TicketValidator) {}

  async validate(ticketId: number) {
    return this.ticketValidator.isTicketValid(ticketId);
  }

  defaultMessage() {
    return `Ticket is not valid.`;
  }
}
