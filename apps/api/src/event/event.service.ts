/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@src/common/pagination/pagination.types';
import { OutboxService } from '@src/outbox/outbox.service';
import { Not, QueryRunner } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventDto } from './dto/update-ticket-type.dto';
import { Event } from './event.entity';
import { EventRepository } from './event.repository';
import { EventEventPattern } from './event.types';
import { EventCreateMessage } from './messages/event-create.message';
import { EventUpdateMessage } from './messages/event-update.message';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository, private readonly outboxService: OutboxService) {}

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

  async findOrCreate(queryRunner: QueryRunner, name: string, ticketProviderId: number): Promise<Event> {
    return this.eventRepository.findOrCreate(queryRunner, name, ticketProviderId);
  }

  async create(body: CreateEventDto): Promise<Event> {
    const { ticketProvider, ...eventParams } = body;

    const queryRunner = this.eventRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const createdEvent = await queryRunner.manager.save(
        this.eventRepository.create({ ...eventParams, ticketProviderId: ticketProvider.id }),
      );
      const event = await queryRunner.manager.findOneBy(Event, { id: createdEvent.id });

      const payload = new EventCreateMessage({ event });
      await this.outboxService.create(queryRunner, EventEventPattern.Create, payload);

      await queryRunner.commitTransaction();

      return this.findByUuid(event.uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(body: UpdateEventDto): Promise<Event> {
    const { ticketProvider, uuid, ...eventParams } = body;

    const queryRunner = this.eventRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager
        .createQueryBuilder(Event, 'event')
        .update(Event)
        .where({ uuid })
        .set({ ...eventParams })
        .execute();

      const updatedEvent = await queryRunner.manager.findOneBy(Event, { uuid });
      const payload = new EventUpdateMessage({ event: updatedEvent });

      await this.outboxService.create(queryRunner, EventEventPattern.Update, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
