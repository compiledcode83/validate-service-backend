import { Module } from '@nestjs/common';
import { TicketTransferRepository } from './ticket-transfer.repository';

@Module({
  providers: [TicketTransferRepository],
})
export class TicketTransferModule {}
