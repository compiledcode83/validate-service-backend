import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EventService } from '@api/event/event.service';
import { UpdateEventDto } from '../dto/update-ticket-type.dto';

@ValidatorConstraint({ name: 'eventDuplicateValidator', async: true })
export class EventDuplicateValidator implements ValidatorConstraintInterface {
  constructor(private readonly eventService: EventService) {}

  async validate(name: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as any;
    const excludeUuid = 'uuid' in args.object ? (args.object as UpdateEventDto).uuid : undefined;

    const event = await this.eventService.findByNameAndTicketProvider(String(name), ticketProvider.id, excludeUuid);

    return event === null;
  }

  defaultMessage() {
    return 'Event with this name already exists';
  }
}
