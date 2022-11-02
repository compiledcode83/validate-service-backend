import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProvider } from './ticket-provider.entity';
import { TicketProviderService } from './ticket-provider.service';
import { TicketProviderRepository } from './ticket-provider.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProvider])],
  providers: [TicketProviderService, TicketProviderRepository],
  exports: [TicketProviderService],
})
export class TicketProviderModule {}
