import { TicketService } from '@api/ticket/ticket.service';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CreateTicketTransferDto } from '../dto/create-ticket-transfer.dto';

@ValidatorConstraint({ name: 'ticketTransferReceiverValidator', async: true })
export class TicketTransferReceiverValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketService: TicketService) {}

  async validate(userUuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketUuid } = args.object as CreateTicketTransferDto;
    const ticket = await this.ticketService.findByUuid(ticketUuid, ['user']);

    return ticket && ticket.user.uuid !== userUuid;
  }

  defaultMessage() {
    return `The receiving user is already an owner of the ticket`;
  }
}
