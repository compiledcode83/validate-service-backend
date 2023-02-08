import { PaginatedResultCursor } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import { Redeem } from '../redeem.entity';

export class RedeemPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Redeem })
  data: Redeem[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
