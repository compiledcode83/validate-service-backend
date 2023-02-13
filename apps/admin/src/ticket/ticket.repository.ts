import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { TicketFilterDto } from './dto/ticket.filter.dto';
import { TicketRepository as CommonRepository } from '@app/ticket/ticket.repository';
import { Ticket } from '@app/ticket/ticket.entity';
import { Like } from 'typeorm/find-options/operator/Like';

@Injectable()
export class TicketRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: TicketFilterDto): Promise<PagingResult<Ticket>> {
    const queryBuilder = this.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.ticketProvider', 'ticketProvider')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .leftJoinAndSelect('ticketType.translations', 'ticketTypeTranslations');

    if ('ticketProviderId' in searchParams) {
      queryBuilder.andWhere({ ticketProviderId: searchParams.ticketProviderId });
    }

    if ('userId' in searchParams) {
      queryBuilder.andWhere({ userId: searchParams.userId });
    }

    if ('searchText' in searchParams) {
      queryBuilder.andWhere({ name: Like(`%${searchParams.searchText}%`) });
    }

    const paginator = buildPaginator({
      entity: Ticket,
      paginationKeys: ['id'],
      query: {
        limit: searchParams.limit,
        order: 'ASC',
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    return paginator.paginate(queryBuilder);
  }
}
