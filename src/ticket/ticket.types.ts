import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResultCursor } from "@src/common/pagination/pagination.types";
import { Ticket } from "./ticket.entity";

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
  Create = 'ticket.create',
  Delete = 'ticket.delete',
}

export const DATE_FORMAT = 'yyyy-MM-dd';

export class TicketPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Ticket })
  data: Ticket[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
