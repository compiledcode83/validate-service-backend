import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateTicketTransferDto } from '../dto/create-ticket-transfer.dto';
import { TicketService } from '../../ticket/ticket.service';
import { TicketStatus } from '@api/ticket/ticket.types';

@ValidatorConstraint({ name: 'ticketExistsValidator', async: true })
export class TicketExistsAndActiveValidator implements ValidatorConstraintInterface {
  private errorMessage: string;

  constructor(private readonly ticketService: TicketService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as CreateTicketTransferDto;
    const ticket = await this.ticketService.findByUuidAndProvider(uuid, ticketProvider.id);

    if (!ticket) {
      this.errorMessage = 'Ticket not found';

      return false;
    }

    if (ticket.status !== TicketStatus.Active) {
      this.errorMessage = 'Ticket is not yet active';

      return false;
    }

    return true;
  }

  defaultMessage() {
    return this.errorMessage;
  }
}
