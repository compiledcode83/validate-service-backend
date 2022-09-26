import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderApiToken } from './ticket-provider-api-token.entity';
import { TicketProviderApiTokenRepository } from './ticket-provider-api-token.repository';
import { TicketProviderApiTokenService } from './ticket-provider-api-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProviderApiToken])],
  providers: [TicketProviderApiTokenService, TicketProviderApiTokenRepository],
  exports: [TicketProviderApiTokenService],
})
export class TicketProviderApiTokenModule {}
