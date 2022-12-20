import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResultCursor } from '@src/common/pagination/pagination.types';
import { Event } from './event.entity';

export class EventPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Event })
  data: Event[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
