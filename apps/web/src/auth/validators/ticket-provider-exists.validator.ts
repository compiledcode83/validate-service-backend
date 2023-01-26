import { TicketProviderService } from '@web/ticket-provider/ticket-provider.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { SendAuthCodeDto } from '../dto/send-auth-code.dto';

@ValidatorConstraint({ name: 'ticketProviderExistsValidator', async: true })
export class TicketProviderExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketProviderService: TicketProviderService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const ticketProvider = await this.ticketProviderService.findByUuid(uuid);

    if (ticketProvider) {
      (args.object as SendAuthCodeDto).ticketProviderId = ticketProvider.id;
    }

    return Boolean(ticketProvider);
  }

  defaultMessage() {
    return 'Ticket provider not found';
  }
}
