import { Locale } from '@app/translation/translation.types';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EventService } from '../event.service';

@ValidatorConstraint({ name: 'eventExistsValidator', async: true })
export class EventExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly eventService: EventService) {}

  async validate(eventUuid: string) {
    const event = await this.eventService.findByUuid(eventUuid, Locale.en_US);

    return event !== null;
  }

  defaultMessage() {
    return `Event doesn't exist`;
  }
}
