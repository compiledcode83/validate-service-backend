import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EventService } from '../../event/event.service';
import { FindTicketTypesDto } from '../dto/find-ticket-types.dto';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';

@ValidatorConstraint({ name: 'eventExistsValidator', async: true })
export class EventExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly eventService: EventService) {}

  async validate(eventUuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProviderId } = args.object as FindTicketTypesDto | CreateTicketTypeDto;
    const event = await this.eventService.findByUuidAndTicketProvider(eventUuid, ticketProviderId);

    return event !== null;
  }

  defaultMessage() {
    return 'Event not found';
  }
}
