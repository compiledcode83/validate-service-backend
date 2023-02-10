import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { TicketRepository as CommonRepository } from '@app/ticket/ticket.repository';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketStatus } from '@app/ticket/ticket.types';

@Injectable()
export class TicketRepository extends CommonRepository {
  async findByUuid(uuid: string, relations: string[] = ['user']): Promise<Ticket> {
    return this.findOne({ where: { uuid, status: Not(TicketStatus.Deleted) }, relations });
  }

  async getPaginatedQueryBuilder(
    searchParams: FindTicketsDto,
    ticketProviderId: number,
  ): Promise<PagingResult<Ticket>> {
    const queryBuilder = this.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .where({ ticketProviderId, status: Not(TicketStatus.Deleted) });

    if ('status' in searchParams) {
      queryBuilder.andWhere({ status: searchParams.status });
    }

    if ('userUuid' in searchParams) {
      queryBuilder.andWhere({ user: { uuid: searchParams.userUuid } });
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
