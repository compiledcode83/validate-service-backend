import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderService } from './ticket-provider.service';
import { TicketProviderRepository } from './ticket-provider.repository';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { TicketProviderSubscriber } from '@app/ticket-provider/ticket-provider.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProvider])],
  providers: [TicketProviderService, TicketProviderRepository, TicketProviderSubscriber],
  exports: [TicketProviderService],
})
export class TicketProviderModule {}
