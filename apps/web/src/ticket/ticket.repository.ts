import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { FindUserTicketsDto } from './dto/find-user-tickets.dto';
import { TicketRepository as CommonRepository } from '@app/ticket/ticket.repository';
import { RedeemStatus } from '@app/redeem/redeem.types';
import { Ticket } from '@app/ticket/ticket.entity';

@Injectable()
export class TicketRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindTicketsDto): Promise<PagingResult<Ticket>> {
    const queryBuilder = this.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.redeems', 'redeems', 'redeems.expire_at > NOW() AND redeems.status = :redeemStatus', {
        redeemStatus: RedeemStatus.NotRedeemed,
      })
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .leftJoinAndSelect('ticketType.event', 'event')
      .where({ purchaseId: searchParams.purchaseId });

    const paginator = buildPaginator({
      entity: Ticket,
      alias: 'ticket',
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

  async getUserPaginatedQueryBuilder(searchParams: FindUserTicketsDto, userId?: number): Promise<PagingResult<Ticket>> {
    const queryBuilder = this.createQueryBuilder('ticket').where({ userId });

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
