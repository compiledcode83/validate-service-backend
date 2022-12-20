import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketType } from './ticket-type.entity';

@Injectable()
export class TicketTypeRepository extends Repository<TicketType> {
  constructor(private readonly dataSource: DataSource) {
    super(TicketType, dataSource.manager);
  }

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

  // async findOrCreate(
  //   queryRunner: QueryRunner,
  //   name: string,
  //   ticketType: string,
  //   ticketProviderId: number,
  // ): Promise<Event> {
  //   const existingEvent = await this.findOneBy({ name, ticketType, ticketProviderId });

  //   if (existingEvent) {
  //     return existingEvent;
  //   }

  //   const { generatedMaps } = await queryRunner.manager
  //     .createQueryBuilder(Event, 'event')
  //     .insert()
  //     .values(this.create({ name, ticketType, ticketProviderId }))
  //     .execute();
  //   const [insertedValues] = generatedMaps;

  //   return queryRunner.manager.findOneBy(Event, { id: insertedValues.id });
  // }
}
