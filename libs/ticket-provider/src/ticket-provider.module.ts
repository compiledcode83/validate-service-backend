import { Module } from '@nestjs/common';
import { TicketProviderRepository } from './ticket-provider.repository';

@Module({
  providers: [TicketProviderRepository],
})
export class TicketProviderModule {}
