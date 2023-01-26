import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderService } from './ticket-provider.service';
import { TicketProviderRepository } from './ticket-provider.repository';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProvider])],
  providers: [TicketProviderService, TicketProviderRepository],
  exports: [TicketProviderService],
})
export class TicketProviderModule {}
