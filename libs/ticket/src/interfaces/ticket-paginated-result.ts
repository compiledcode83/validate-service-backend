import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';
import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '../ticket.entity';

export class TicketPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Ticket })
  data: Ticket[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
