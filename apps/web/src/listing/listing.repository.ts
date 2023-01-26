import { ListingDto } from './dto/listing.filter.dto';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { Injectable } from '@nestjs/common';
import { ListingRepository as CommonRepository } from '@app/listing/listing.repository';
import { ListingStatus } from '@app/listing/listing.types';
import { Listing } from '@app/listing/listing.entity';

@Injectable()
export class ListingRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: ListingDto): Promise<PagingResult<Listing>> {
    const queryBuilder = this.createQueryBuilder('listing')
      .leftJoin('listing.event', 'event')
      .where({ status: ListingStatus.Active })
      .andWhere('event.uuid = :eventUuid', { eventUuid: searchParams.eventUuid });

    const paginator = buildPaginator({
      entity: Listing,
      alias: 'listing',
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
