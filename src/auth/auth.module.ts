import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TicketProviderApiTokenModule } from '@src/ticket-provider-api-token/ticket-provider-api-token.module';
import { TicketProviderModule } from '@src/ticket-provider/ticket-provider.module';
import { AuthService } from './auth.service';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [TicketProviderApiTokenModule, TicketProviderModule],
  providers: [AuthService, ApiKeyStrategy, JwtStrategy, LocalStrategy, JwtService],
})
export class AuthModule {}
