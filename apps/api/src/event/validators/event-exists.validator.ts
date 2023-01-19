import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EventService } from '@api/event/event.service';

@ValidatorConstraint({ name: 'eventExistsValidator', async: true })
export class EventExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly eventService: EventService) {}

  async validate(uuid: string, args: ValidationArguments): Promise<boolean> {
    const { ticketProvider } = args.object as any;
    const event = await this.eventService.findByUuidAndTicketProvider(uuid, ticketProvider.id);

    return event !== null;
  }

  defaultMessage() {
    return 'Event not found';
  }
}
