import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResultCursor } from '@src/common/pagination/pagination.types';
import { Event } from './event.entity';

export class EventPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Event })
  data: Event[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}

export enum EventEventPattern {
  Create = 'event.create',
  Update = 'event.update',
}
