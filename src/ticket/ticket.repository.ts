import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';
import { TicketStatus } from './ticket.types';

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

    if ('status' in searchParams) {
      queryBuilder.andWhere({ status: searchParams.status });
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

  async validate(uuid: string, ticketProviderId: number): Promise<Ticket> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const ticket = await queryRunner.manager
        .createQueryBuilder(Ticket, 'ticket')
        .setLock('pessimistic_write')
        .where({ uuid, ticketProviderId, status: TicketStatus.Active })
        .getOne();

      if (!ticket) {
        throw new BadRequestException('Ticket not found');
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Ticket)
        .where({ uuid })
        .set({ status: TicketStatus.Validated, validatedAt: new Date() })
        .execute();

      await queryRunner.commitTransaction();

      return this.findOne({ where: { uuid } });
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
