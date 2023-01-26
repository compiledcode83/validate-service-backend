import { TicketStatus } from '@app/ticket/ticket.types';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';
import { TicketService } from '../ticket.service';

@ValidatorConstraint({ name: 'ticketIsDeletableValidator', async: true })
export class TicketIsDeletableValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketService: TicketService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as ValidateTicketDto;
    const ticket = await this.ticketService.findByUuidAndProvider(uuid, ticketProvider.id);

    return ticket && ticket.status === TicketStatus.Active;
  }

  defaultMessage() {
    return `Ticket not found or cannot be deleted`;
  }
}
