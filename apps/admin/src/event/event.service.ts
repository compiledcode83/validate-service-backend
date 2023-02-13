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

  async createOrInsert(
    name: string,
    ticketProviderId: number,
    locale: Locale,
    description?: string,
    imageUrl?: string,
  ): Promise<Event> {
    const createdEvent = await this.eventRepository.createOrInsert(name, ticketProviderId, description, imageUrl);
    const event = await this.findById(createdEvent.id);

    TranslationService.mapEntity(event, locale);

    return event;
  }

  async findByUuid(uuid: string): Promise<Event> {
    return this.eventRepository.findOneBy({ uuid });
  }

  async findById(id: number): Promise<Event> {
    return this.eventRepository.findOneBy({ id });
  }

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<Event> {
    return this.eventRepository.findOneBy({ uuid, ticketProviderId });
  }

  async findByIdAndUpdate(id: number, name: string) {
    return this.eventRepository.update({ id }, { name });
  }
}
