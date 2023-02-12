import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Event } from '@app/event/event.entity';
import { TranslationService } from '@app/translation/translation.service';
import { Locale } from '@app/translation/translation.types';
import { Injectable } from '@nestjs/common';
import { FindEventsDto } from './dto/find-events.dto';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async findAllPaginated(searchParams: FindEventsDto, locale: Locale): Promise<PaginatedResult<Event>> {
    const events = await this.eventRepository.getPaginatedQueryBuilder(searchParams);

    events.data.map((event) => TranslationService.mapEntity(event, locale));

    return events;
  }

  async findByUuid(uuid: string, locale: Locale = Locale.en_US): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ uuid });

    TranslationService.mapEntity(event, locale);

    return event;
  }
}
