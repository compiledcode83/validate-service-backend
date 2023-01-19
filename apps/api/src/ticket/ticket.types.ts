import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResultCursor } from '@api/common/pagination/pagination.types';
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
  TicketValidate = 'ticket.validate',
}

export const DEFAULT_IMAGE = `https://loremflickr.com/cache/resized/65535_51819602222_b063349f16_c_640_480_nofilter.jpg`;

export class TicketPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Ticket })
  data: Ticket[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
