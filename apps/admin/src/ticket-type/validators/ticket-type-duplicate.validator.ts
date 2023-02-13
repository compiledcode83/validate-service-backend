import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EventService } from '../../event/event.service';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { TicketTypeService } from '../ticket-type.service';

@ValidatorConstraint({ name: 'ticketTypeExistsDuplicateValidator', async: true })
export class TicketTypeDuplicateValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketTypeService: TicketTypeService, private readonly eventService: EventService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProviderId } = args.object as CreateTicketTypeDto;

    if (!uuid) {
      return false;
    }

    const ticketType = await this.ticketTypeService.findByUuidAndTicketProvider(uuid, ticketProviderId);

    return ticketType === null;
  }

  defaultMessage() {
    return 'Ticket type with this uuid already exists';
  }
}
