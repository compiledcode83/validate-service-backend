import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { ListingRepository as CommonRepository } from '@app/listing/listing.repository';
import { FindListingDto } from './dto/find-listing.dto';
import { Listing } from '@app/listing/listing.entity';

@Injectable()
export class ListingRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindListingDto): Promise<PagingResult<Listing>> {
    const queryBuilder = this.createQueryBuilder('listing');

    const paginator = buildPaginator({
      entity: Listing,
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
