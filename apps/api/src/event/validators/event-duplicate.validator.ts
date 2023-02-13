import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EventService } from '@api/event/event.service';

@ValidatorConstraint({ name: 'eventDuplicateValidator', async: true })
export class EventDuplicateValidator implements ValidatorConstraintInterface {
  constructor(private readonly eventService: EventService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as any;

    const event = await this.eventService.findByUuidAndTicketProvider(uuid, ticketProvider.id);

    return event === null;
  }

  defaultMessage() {
    return 'Event with this uuid already exists';
  }
}
