import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';
import { Listing } from '@app/listing/listing.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ListingPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Listing })
  data: Listing[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
