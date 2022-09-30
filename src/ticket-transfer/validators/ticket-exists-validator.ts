import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateTicketTransferDto } from '../dto/create-ticket-transfer.dto';
import { TicketService } from '../../ticket/ticket.service';

@ValidatorConstraint({ name: 'ticketExistsValidator', async: true })
export class TicketExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketService: TicketService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as CreateTicketTransferDto;
    const ticket = await this.ticketService.findByUuidAndProvider(uuid, ticketProvider.id);

    return Boolean(ticket);
  }

  defaultMessage() {
    return 'Ticket not found';
  }
}
