import { Module } from '@nestjs/common';
import { TicketProviderApiTokenModule } from '@src/ticket-provider-api-token/ticket-provider-api-token.module';
import { AuthService } from './auth.service';
import { ApiTokenStrategy } from './strategies/api-token.strategy';

@Module({
  imports: [TicketProviderApiTokenModule],
  providers: [AuthService, ApiTokenStrategy],
})
export class AuthModule {}
