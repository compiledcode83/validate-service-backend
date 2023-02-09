import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { OutboxRepository as CommonRepository } from '@app/outbox/outbox.repository';
import { FindOutboxDto } from './dto/find-outbox.dto';
import { Outbox } from '@app/outbox/outbox.entity';
import { Brackets } from 'typeorm';

@Injectable()
export class OutboxRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindOutboxDto): Promise<PagingResult<Outbox>> {
    const queryBuilder = this.createQueryBuilder('outbox');

    if (searchParams.status) {
      queryBuilder.andWhere({
        status: searchParams.status,
      });
    }

    if (searchParams.eventName) {
      queryBuilder.andWhere({
        eventName: searchParams.eventName,
      });
    }

    if (searchParams.operationUuid) {
      queryBuilder.andWhere({
        operationUuid: searchParams.operationUuid,
      });
    }

    const paginator = buildPaginator({
      entity: Outbox,
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
