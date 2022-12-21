import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResultCursor } from "@src/common/pagination/pagination.types";
import { TicketType } from "./ticket-type.entity";

export enum TicketTypeResaleStatus {
  Disabled,
  Enabled,
}

export enum TicketTypeSaleStatus {
  Disabled,
  Enabled,
}

export const DATE_FORMAT = 'yyyy-MM-dd';

export class TicketTypePaginatedResult {
  @ApiProperty({ isArray: true, type: () => TicketType })
  data: TicketType[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}

export enum TicketTypeEventPattern {
  Create = 'ticket.type.create',
  Update = 'ticket.type.update',
}
