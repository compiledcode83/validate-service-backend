import { Module } from '@nestjs/common';
import { TicketTypeRepository } from './ticket-type.repository';

@Module({
  providers: [TicketTypeRepository],
})
export class TicketTypeModule {}
