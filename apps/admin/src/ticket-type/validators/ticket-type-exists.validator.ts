import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TicketTypeService } from '../ticket-type.service';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';

@ValidatorConstraint({ name: 'ticketTypeExistsValidator', async: true })
export class TicketTypeExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProviderId } = args.object as UpdateTicketTypeDto;
    const ticketType = await this.ticketTypeService.findByUuidAndTicketProvider(uuid, ticketProviderId);

    return ticketType !== null;
  }

  defaultMessage() {
    return 'Ticket type not found';
  }
}
