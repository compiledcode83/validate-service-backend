import { ApiProperty } from '@nestjs/swagger';
import { Listing } from './listing.entity';
import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';

export enum ListingStatus {
  Active = 'active',
  Sold = 'sold',
  Canceled = 'canceled',
}

export class ListingPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Listing })
  data: Listing[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
