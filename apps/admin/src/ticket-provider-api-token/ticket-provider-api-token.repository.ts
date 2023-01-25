import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { TicketProviderApiTokenFilterDto } from './dto/ticket-provider-api-token.filter.dto';
import { TicketProviderApiToken } from './ticket-provider-api-token.entity';

@Injectable()
export class TicketProviderApiTokenRepository extends Repository<TicketProviderApiToken> {
  constructor(public readonly dataSource: DataSource) {
    super(TicketProviderApiToken, dataSource.manager);
  }

  async getPaginatedQueryBuilder(
    searchParams: TicketProviderApiTokenFilterDto,
  ): Promise<PagingResult<TicketProviderApiToken>> {
    const queryBuilder = this.createQueryBuilder('ticket_provider_api_token').leftJoinAndMapOne(
      'ticket_provider_api_token.ticketProvider',
      'ticket_provider_api_token.ticketProvider',
      'ticket_provider',
    );

    if ('ticketProviderId' in searchParams) {
      queryBuilder.andWhere({ ticketProviderId: searchParams.ticketProviderId });
    }

    const paginator = buildPaginator({
      entity: TicketProviderApiToken,
      alias: 'ticket_provider_api_token',
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
