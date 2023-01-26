import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindEventsDto } from './dto/find-events.dto';
import { EventRepository as CommonRepository } from '@app/event/event.repository';
import { Event } from '@app/event/event.entity';

@Injectable()
export class EventRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindEventsDto, ticketProviderId: number): Promise<PagingResult<Event>> {
    const queryBuilder = this.createQueryBuilder('event').where({ ticketProviderId });

    const paginator = buildPaginator({
      entity: Event,
      paginationKeys: ['id', searchParams.orderParam],
      query: {
        limit: searchParams.limit,
        order: searchParams.orderType,
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    return paginator.paginate(queryBuilder);
  }

  async findOrCreate(queryRunner: QueryRunner, name: string, ticketProviderId: number): Promise<Event> {
    const existingEvent = await this.findOneBy({ name, ticketProviderId });

    if (existingEvent) {
      return existingEvent;
    }

    const { generatedMaps } = await queryRunner.manager
      .createQueryBuilder(Event, 'event')
      .insert()
      .values(this.create({ name, ticketProviderId }))
      .execute();
    const [insertedValues] = generatedMaps;

    return queryRunner.manager.findOneBy(Event, { id: insertedValues.id });
  }
}
