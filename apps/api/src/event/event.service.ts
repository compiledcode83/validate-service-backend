/* eslint-disable @typescript-eslint/no-unused-vars */
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Event } from '@app/event/event.entity';
import { EventEventPattern, EventTranslatableAttributes } from '@app/event/event.types';
import { EventCreateMessage } from '@app/event/messages/event-create.message';
import { EventUpdateMessage } from '@app/event/messages/event-update.message';
import { OutboxService } from '@app/outbox/outbox.service';
import { TranslationService } from '@app/translation/translation.service';
import { EntityAttribute, EntityName, Locale } from '@app/translation/translation.types';
import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly outboxService: OutboxService,
    private readonly translationService: TranslationService,
  ) {}

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<Event> {
    return this.eventRepository.createQueryBuilder('event').where({ uuid, ticketProviderId }).getOne();
  }

  async findByUuid(uuid: string, locale: Locale = Locale.en_US): Promise<Event> {
    const event = await this.eventRepository.findOneBy({ uuid });

    return TranslationService.mapEntity(event, locale);
  }

  async findAllPaginated(
    searchParams: FindEventsDto,
    ticketProviderId: number,
    locale: Locale,
  ): Promise<PaginatedResult<Event>> {
    const events = await this.eventRepository.getPaginatedQueryBuilder(searchParams, ticketProviderId);

    events.data.map((event) => TranslationService.mapEntity(event, locale));

    return events;
  }

  async create(body: CreateEventDto, locale: Locale): Promise<Event> {
    const { ticketProvider, ...eventParams } = body;

    const queryRunner = this.eventRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const createdEvent = await queryRunner.manager.save(
        this.eventRepository.create({ ...eventParams, ticketProviderId: ticketProvider.id }),
      );
      const event = await queryRunner.manager.findOneBy(Event, { id: createdEvent.id });
      await this.saveTranslations(queryRunner, createdEvent.id, body, locale);

      const payload = new EventCreateMessage({ event });
      await this.outboxService.create(queryRunner, EventEventPattern.Create, payload);

      await queryRunner.commitTransaction();

      return this.findByUuid(event.uuid, locale);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(body: UpdateEventDto, locale: Locale): Promise<Event> {
    const { ticketProvider, uuid, name, shortDescription, longDescription, ...eventParams } = body;

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
      await this.saveTranslations(queryRunner, updatedEvent.id, body, locale);
      const payload = new EventUpdateMessage({ event: updatedEvent });

      await this.outboxService.create(queryRunner, EventEventPattern.Update, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(uuid, locale);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async saveTranslations(
    queryRunner: QueryRunner,
    eventId: number,
    dto: CreateEventDto | UpdateEventDto,
    locale: Locale,
  ) {
    const saveTranslations: EntityAttribute[] = [];
    const eventTranslatableAttributes = Object.values<string>(EventTranslatableAttributes);

    for (const attributeName of Object.keys(dto)) {
      if (eventTranslatableAttributes.includes(attributeName)) {
        saveTranslations.push({
          name: attributeName,
          value: dto[attributeName],
        });
      }
    }

    await this.translationService.saveTranslations(queryRunner, EntityName.Event, eventId, saveTranslations, locale);
  }
}
