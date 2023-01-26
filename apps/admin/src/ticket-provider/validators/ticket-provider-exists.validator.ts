import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TicketProviderValidator } from '../ticket-provider.validator';

@ValidatorConstraint({ name: 'TicketProviderExistsValidator', async: true })
export class TicketProviderExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketProviderValidator: TicketProviderValidator) {}

  async validate(ticketProviderId: number) {
    return this.ticketProviderValidator.isTicketProviderValid(ticketProviderId);
  }

  defaultMessage() {
    return `Ticket provider is not valid.`;
  }
}
