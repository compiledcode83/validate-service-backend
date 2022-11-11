import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindEventsDto } from './dto/find-events.dto';
import { Event } from './event.entity';

@Injectable()
export class EventRepository extends Repository<Event> {
  constructor(private readonly dataSource: DataSource) {
    super(Event, dataSource.manager);
  }

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

  async createOrInsert(name: string, ticketType: string, ticketProviderId: number): Promise<Event> {
    const existingEvent = await this.findOneBy({ name, ticketType, ticketProviderId });

    if (!existingEvent) {
      return this.save({ name, ticketType, ticketProviderId });
    }

    return existingEvent;
  }
}
