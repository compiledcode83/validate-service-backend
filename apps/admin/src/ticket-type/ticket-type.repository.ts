import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { EntityName } from '@app/translation/translation.types';

@Injectable()
export class TicketTypeRepository extends Repository<TicketType> {
  constructor(public readonly dataSource: DataSource) {
    super(TicketType, dataSource.manager);
  }

  async getPaginatedQueryBuilder(searchParams: FindTicketTypesDto, eventId: number): Promise<PagingResult<TicketType>> {
    const queryBuilder = this.createQueryBuilder('ticket_type');

    if (searchParams.eventUuid) {
      queryBuilder.where({ eventId });
    }

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

  async findOneBy(where: FindOptionsWhere<TicketType> | FindOptionsWhere<TicketType>[]): Promise<TicketType> {
    return this.createQueryBuilder('ticket_type')
      .where(where)
      .leftJoinAndSelect(
        'ticket_type.translations',
        'translations',
        'translations.entity_name = :entityName AND translations.entity_id = ticket_type.id',
        { entityName: EntityName.TicketType },
      )
      .getOne();
  }
}
