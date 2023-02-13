/* eslint-disable @typescript-eslint/no-unused-vars */
import { TranslationService } from '@app/translation/translation.service';
import { EntityAttribute, EntityName, Locale } from '@app/translation/translation.types';
import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { Event } from './event.entity';
import { EventRepository } from './event.repository';
import { EventTranslatableAttributes } from './event.types';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly translationService: TranslationService,
  ) {}

  async findOrCreate(
    queryRunner: QueryRunner,
    event: Partial<Event>,
    ticketProviderId: number,
    locale: Locale,
  ): Promise<Event> {
    const existingEvent = await this.eventRepository.findOneBy({ uuid: event.uuid, ticketProviderId });

    if (existingEvent) {
      return existingEvent;
    }

    const { generatedMaps } = await queryRunner.manager
      .createQueryBuilder(Event, 'event')
      .insert()
      .values(this.eventRepository.create({ ...event, ticketProviderId }))
      .execute();
    const [insertedValues] = generatedMaps;

    await this.saveTranslations(queryRunner, insertedValues.id, event, locale);

    return queryRunner.manager.findOneBy(Event, { id: insertedValues.id });
  }

  private async saveTranslations(
    queryRunner: QueryRunner,
    eventId: number,
    eventLikeDto: Partial<Event>,
    locale: Locale,
  ) {
    const saveTranslations: EntityAttribute[] = [];
    const eventTranslatableAttributes = Object.values<string>(EventTranslatableAttributes);

    for (const attributeName of Object.keys(eventLikeDto)) {
      if (eventTranslatableAttributes.includes(attributeName)) {
        saveTranslations.push({
          name: attributeName,
          value: eventLikeDto[attributeName],
        });
      }
    }

    await this.translationService.saveTranslations(queryRunner, EntityName.Event, eventId, saveTranslations, locale);
  }
}
