import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { TicketTypeService } from '../ticket-type.service';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';

@ValidatorConstraint({ name: 'ticketTypeExistsDuplicateValidator', async: true })
export class TicketTypeDuplicateValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as CreateTicketTypeDto;

    if (!uuid) {
      return false;
    }

    const ticketType = await this.ticketTypeService.findByUuidAndTicketProvider(uuid, ticketProvider.id);

    return ticketType === null;
  }

  defaultMessage() {
    return 'Ticket type with this uuid already exists';
  }
}
