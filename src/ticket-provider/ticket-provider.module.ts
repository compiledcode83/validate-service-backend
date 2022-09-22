import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProvider } from './ticket-provider.entity';
import { RepositoryFactory } from './repository.factory';
import { TicketProviderService } from './ticket-provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepositoryFactory, TicketProvider])],
  providers: [TicketProviderService, RepositoryFactory],
})
export class TicketProviderModule {}
