import { Module } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';

@Module({
  providers: [TicketRepository],
})
export class TicketModule {}
