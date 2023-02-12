import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TicketTypeRepository extends Repository<TicketType> {
  constructor(public readonly dataSource: DataSource) {
    super(TicketType, dataSource.manager);
  }

  async getPaginatedQueryBuilder(searchParams: FindTicketTypesDto, eventId: number): Promise<PagingResult<TicketType>> {
    const queryBuilder = this.createQueryBuilder('ticket_type');

    if (searchParams.eventUuid) {
      queryBuilder.where({ eventId });
    }

    const paginator = buildPaginator({
      alias: 'ticket_type',
      entity: TicketType,
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
}
