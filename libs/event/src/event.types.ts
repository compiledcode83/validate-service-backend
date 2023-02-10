import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';
import { ApiProperty } from '@nestjs/swagger';
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

export enum EventResaleStatus {
  Disabled,
  Enabled,
}

export enum EventWeekday {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
}

export const EventTranslatableAttributes = ['name', 'shortDescription', 'longDescription']
