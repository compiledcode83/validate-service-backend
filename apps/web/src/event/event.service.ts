import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Event } from '@app/event/event.entity';
import { Locale } from '@app/translation/translation.types';
import { Injectable } from '@nestjs/common';
import { FindEventsDto } from './dto/find-events.dto';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async findAllPaginated(searchParams: FindEventsDto, locale: Locale): Promise<PaginatedResult<Event>> {
    return this.eventRepository.getPaginatedQueryBuilder(searchParams, locale);
  }

  async findByUuid(uuid: string, locale: Locale): Promise<Event> {
    return this.eventRepository.findOneBy({ uuid }, locale);
  }
}
