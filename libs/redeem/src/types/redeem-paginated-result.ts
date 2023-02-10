import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';
import { ApiProperty } from '@nestjs/swagger';
import { Redeem } from '../redeem.entity';

export class RedeemPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Redeem })
  data: Redeem[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
