/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@src/common/pagination/pagination.types';
import { Not, QueryRunner } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventDto } from './dto/update-ticket-type.dto';
import { Event } from './event.entity';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<Event> {
    return this.eventRepository.findOneBy({ uuid, ticketProviderId });
  }

  async findByNameAndTicketProvider(name: string, ticketProviderId: number, excludeUuid?: string): Promise<Event> {
    const findParams = { name, ticketProviderId };

    if (excludeUuid) {
      findParams['uuid'] = Not(excludeUuid);
    }

    return this.eventRepository.findOneBy(findParams);
  }

  async findByUuid(uuid: string): Promise<Event> {
    return this.eventRepository.findOneBy({ uuid });
  }

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

  async create(body: CreateEventDto): Promise<Event> {
    const { ticketProvider, ...eventParams } = body;

    return this.eventRepository.save(
      this.eventRepository.create({ ...eventParams, ticketProviderId: ticketProvider.id }),
    );
  }

  async update(body: UpdateEventDto): Promise<Event> {
    const { ticketProvider, uuid, ...eventParams } = body;

    await this.eventRepository.update({ uuid: body.uuid }, this.eventRepository.create({ ...eventParams }));

    return this.findByUuid(uuid);
  }
}
