import { Module } from '@nestjs/common';
import { TicketProviderApiTokenModule } from '@src/ticket-provider-api-token/ticket-provider-api-token.module';
import { AuthService } from './auth.service';
import { ApiKeyStrategy } from './strategies/api-key.strategy';

@Module({
  imports: [TicketProviderApiTokenModule],
  providers: [AuthService, ApiKeyStrategy],
})
export class AuthModule {}
