import { Injectable } from '@nestjs/common';
import { DataSource, Not, QueryRunner, Repository } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';
import { TicketStatus } from './ticket.types';

@Injectable()
export class TicketRepository extends Repository<Ticket> {
  constructor(public readonly dataSource: DataSource) {
    super(Ticket, dataSource.manager);
  }

  async createTicket(queryRunner: QueryRunner, data: Partial<Ticket>) {
    return queryRunner.manager.save(this.create(data));
  }

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
