import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { EventRepository } from './event.repository';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(private readonly eventRepo: EventRepository) {}

  async findByUuidAndTicketProvider(eventUuid: string, ticketProviderId: number) {
    return this.eventRepo.findOne({ where: { uuid: eventUuid, ticketProviderId: ticketProviderId } });
  }

  async findOrCreate(
    queryRunner: QueryRunner,
    name: string,
    ticketProviderId: number,
    eventUuid: string,
  ): Promise<Event> {
    const existingEvent = await this.eventRepo.findOne({ where: { uuid: eventUuid, ticketProviderId } });

    if (existingEvent) {
      return existingEvent;
    }

    return this.eventRepo.save({
      name,
      ticketProviderId,
      uuid: eventUuid,
    });
  }
}
