import { Injectable } from '@nestjs/common';
import { In, QueryRunner } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketTypeRepository as CommonRepository } from '@app/ticket-type/ticket-type.repository';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';

@Injectable()
export class TicketTypeRepository extends CommonRepository {
  async findSellableWithLock(queryRunner: QueryRunner, uuid: string[]): Promise<TicketType[]> {
    return queryRunner.manager
      .createQueryBuilder(TicketType, 'ticket_type')
      .setLock('pessimistic_write')
      .where({ uuid: In(uuid), saleEnabled: TicketTypeSaleStatus.Enabled })
      .andWhere('NOW() BETWEEN sale_enabled_from_date AND sale_enabled_to_date')
      .getMany();
  }

  async getPaginatedQueryBuilder(searchParams: FindTicketTypesDto): Promise<PagingResult<TicketType>> {
    const queryBuilder = this.createQueryBuilder('ticket_type')
      .leftJoin('ticket_type.event', 'event')
      .where('ticket_type.saleEnabled = :saleEnabled', { saleEnabled: TicketTypeSaleStatus.Enabled })
      .andWhere('NOW() BETWEEN sale_enabled_from_date AND sale_enabled_to_date')
      .andWhere('event.uuid = :eventUuid', { eventUuid: searchParams.eventUuid });

    const paginator = buildPaginator({
      entity: TicketType,
      alias: 'ticket_type',
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
