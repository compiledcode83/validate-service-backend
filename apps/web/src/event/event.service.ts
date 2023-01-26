import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Event } from '@app/event/event.entity';
import { Injectable } from '@nestjs/common';
import { FindEventsDto } from './dto/find-events.dto';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async findAllPaginated(searchParams: FindEventsDto): Promise<PaginatedResult<Event>> {
    return this.eventRepository.getPaginatedQueryBuilder(searchParams);
  }

  async findByUuid(uuid: string): Promise<Event> {
    return this.eventRepository.findOneBy({ uuid });
  }
}
