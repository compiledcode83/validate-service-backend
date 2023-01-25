import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { TicketTransferFilterDto } from './dto/ticket-transfer.filter.dto';
import { TicketTransferRepository as CommonRepository } from '@app/ticket-transfer/ticket-transfer.repository';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';

@Injectable()
export class TicketTransferRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: TicketTransferFilterDto): Promise<PagingResult<TicketTransfer>> {
    const queryBuilder = this.createQueryBuilder('ticket_transfer')
      .leftJoinAndMapOne('ticket_transfer.ticketProvider', 'ticket_transfer.ticketProvider', 'ticket_provider')
      .leftJoinAndMapOne('ticket_transfer.userFrom', 'ticket_transfer.userFrom', 'user_from')
      .leftJoinAndMapOne('ticket_transfer.userTo', 'ticket_transfer.userTo', 'user_to')
      .leftJoinAndMapOne('ticket_transfer.ticket', 'ticket_transfer.ticket', 'ticket');

    if ('uuid' in searchParams) {
      queryBuilder.andWhere({ uuid: searchParams.uuid });
    }

    if ('ticketProviderId' in searchParams) {
      queryBuilder.andWhere({ ticketProviderId: searchParams.ticketProviderId });
    }

    const paginator = buildPaginator({
      entity: TicketTransfer,
      alias: 'ticket_transfer',
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
