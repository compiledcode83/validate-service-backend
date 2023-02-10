/* eslint-disable @typescript-eslint/no-unused-vars */
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Event } from '@app/event/event.entity';
import { EventEventPattern } from '@app/event/event.types';
import { EventCreateMessage } from '@app/event/messages/event-create.message';
import { EventUpdateMessage } from '@app/event/messages/event-update.message';
import { OutboxService } from '@app/outbox/outbox.service';
import { Injectable } from '@nestjs/common';
import { Not, QueryRunner } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventDto } from './dto/update-ticket-type.dto';
import { EventRepository } from './event.repository';
import { EventService as CommonEventService } from '@app/event/event.service';

@Injectable()
export class EventService extends CommonEventService {
  constructor(private readonly eventRepository: EventRepository, private readonly outboxService: OutboxService) {
    super(eventRepository);
  }

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
