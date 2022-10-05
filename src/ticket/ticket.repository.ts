import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';

@Injectable()
export class TicketRepository extends Repository<Ticket> {
  constructor(private readonly dataSource: DataSource) {
    super(Ticket, dataSource.manager);
  }

  async getPaginatedQueryBuilder(
    searchParams: FindTicketsDto,
    ticketProviderId: number,
  ): Promise<PagingResult<Ticket>> {
    const queryBuilder = this.createQueryBuilder('ticket').where({ ticketProviderId });

    if ('seedPhrase' in searchParams) {
      queryBuilder.leftJoin('ticket.user', 'user').andWhere({ user: { seedPhrase: searchParams.seedPhrase } });
    }

    if ('userUuid' in searchParams) {
      queryBuilder.leftJoin('ticket.user', 'user').andWhere({ user: { uuid: searchParams.userUuid } });
    }

    const paginator = buildPaginator({
      entity: Ticket,
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
