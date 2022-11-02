import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderRefreshToken } from './ticket-provider-refresh-token.entity';
import { TicketProviderRefreshTokenRepository } from './ticket-provider-refresh-token.repository';
import { TicketProviderRefreshTokenService } from './ticket-provider-refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProviderRefreshToken])],
  providers: [TicketProviderRefreshTokenService, TicketProviderRefreshTokenRepository],
  exports: [TicketProviderRefreshTokenService],
})
export class TicketProviderRefreshTokenModule {}
