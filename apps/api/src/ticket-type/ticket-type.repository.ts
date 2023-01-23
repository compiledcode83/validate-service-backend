import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketTypeRepository as CommonRepository } from '@app/ticket-type/ticket-type.repository';
import { TicketType } from '@app/ticket-type/ticket-type.entity';

@Injectable()
export class TicketTypeRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindTicketTypesDto, eventId: number): Promise<PagingResult<TicketType>> {
    const queryBuilder = this.createQueryBuilder('ticket_type').where({ eventId });

    const paginator = buildPaginator({
      alias: 'ticket_type',
      entity: TicketType,
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

  async findOrCreate(
    queryRunner: QueryRunner,
    eventId: number,
    name: string,
    ticketDateStart: any,
    ticketDateEnd?: any,
  ): Promise<TicketType> {
    const existingTicketType = await this.findOneBy({ name, ticketDateStart, ticketDateEnd, eventId });

    if (existingTicketType) {
      return existingTicketType;
    }

    const { generatedMaps } = await queryRunner.manager
      .createQueryBuilder(TicketType, 'ticket_type')
      .insert()
      .values(this.create({ name, ticketDateStart, ticketDateEnd, eventId }))
      .execute();
    const [insertedValues] = generatedMaps;

    return queryRunner.manager.findOneBy(TicketType, { id: insertedValues.id });
  }
}
