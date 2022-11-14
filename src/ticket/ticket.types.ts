import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResultCursor } from '@src/common/pagination/pagination.types';
import { Ticket } from './ticket.entity';

export class TicketAdditionalData {
  [key: string]: string | number;
}

export enum TicketStatus {
  Creating = 'creating',
  Active = 'active',
  Validated = 'validated',
  Deleted = 'deleted',
}

export enum TicketEventPattern {
  TicketCreate = 'ticket.create',
  TicketCreateReply = 'ticket.create.reply',
  TicketDelete = 'ticket.delete',
  TicketDeleteReply = 'ticket.delete.reply',
}

export const DATE_FORMAT = 'yyyy-MM-dd';

export class TicketPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Ticket })
  data: Ticket[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
