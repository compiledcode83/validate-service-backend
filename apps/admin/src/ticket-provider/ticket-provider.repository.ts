import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { TicketProviderFilterDto } from './dto/ticket-provider.filter.dto';
import { TicketProviderRepository as CommonRepository } from '@app/ticket-provider/ticket-provider.repository';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Like } from 'typeorm/find-options/operator/Like';

@Injectable()
export class TicketProviderRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: TicketProviderFilterDto): Promise<PagingResult<TicketProvider>> {
    const queryBuilder = this.createQueryBuilder('ticket_provider');

    if ('status' in searchParams) {
      queryBuilder.andWhere({ status: searchParams.status });
    }

    if ('searchText' in searchParams) {
      queryBuilder.andWhere([
        /** @todo fix sql injection */
        { name: Like(`%${searchParams.searchText}%`) },
        { email: Like(`%${searchParams.searchText}%`) },
      ]);
    }

    const paginator = buildPaginator({
      entity: TicketProvider,
      alias: 'ticket_provider',
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
