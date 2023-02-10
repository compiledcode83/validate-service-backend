import { Module } from '@nestjs/common';
import { TicketProviderRepository } from './ticket-provider.repository';
import { TicketProviderService } from './ticket-provider.service';

@Module({
  providers: [TicketProviderRepository, TicketProviderService],
  exports: [TicketProviderService],
})
export class TicketProviderModule {}
