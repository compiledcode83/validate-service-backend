import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@src/common/pagination/pagination.types';
import { QueryRunner } from 'typeorm';
import { FindEventsDto } from './dto/find-events.dto';
import { Event } from './event.entity';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async findAllPaginated(searchParams: FindEventsDto, ticketProviderId: number): Promise<PaginatedResult<Event>> {
    return this.eventRepository.getPaginatedQueryBuilder(searchParams, ticketProviderId);
  }

  async findOrCreate(
    queryRunner: QueryRunner,
    name: string,
    ticketType: string,
    ticketProviderId: number,
  ): Promise<Event> {
    return this.eventRepository.findOrCreate(queryRunner, name, ticketType, ticketProviderId);
  }
}
