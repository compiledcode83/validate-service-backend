import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EventService } from '@src/event/event.service';
import { TicketTypeService } from '../ticket-type.service';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';

@ValidatorConstraint({ name: 'ticketTypeExistsDuplicateValidator', async: true })
export class TicketTypeDuplicateValidator implements ValidatorConstraintInterface {
  constructor(private readonly ticketTypeService: TicketTypeService, private readonly eventService: EventService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    if ('eventUuid' in args.object) {
      const { eventUuid } = args.object as CreateTicketTypeDto;
      const event = await this.eventService.findByUuid(eventUuid);
      const ticketType = await this.ticketTypeService.findByNameAndEvent(name, event.id);

      return ticketType === null;
    }

    if ('uuid' in args.object) {
      const { uuid, ticketProvider } = args.object as UpdateTicketTypeDto;
      const currentTicketType = await this.ticketTypeService.findByUuidAndTicketProvider(uuid, ticketProvider.id);

      const ticketType = await this.ticketTypeService.findByNameAndEvent(name, currentTicketType.eventId, uuid);

      return ticketType === null;
    }
  }

  defaultMessage() {
    return 'Ticket type with this name already exists';
  }
}
