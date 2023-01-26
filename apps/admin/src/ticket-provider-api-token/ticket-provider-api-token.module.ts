import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderModule } from '@admin/ticket-provider/ticket-provider.module';
import { TicketProviderValidator } from '@admin/ticket-provider/ticket-provider.validator';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { TicketProviderApiTokenController } from './ticket-provider-api-token.controller';
import { TicketProviderApiToken } from './ticket-provider-api-token.entity';
import { TicketProviderApiTokenRepository } from './ticket-provider-api-token.repository';
import { TicketProviderApiTokenService } from './ticket-provider-api-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProviderApiToken]), TicketProviderModule],
  controllers: [TicketProviderApiTokenController],
  providers: [
    TicketProviderApiTokenService,
    TicketProviderApiTokenRepository,
    TicketProviderValidator,
    TicketProviderExistsValidator,
  ],
  exports: [TicketProviderApiTokenService],
})
export class TicketProviderApiTokenModule {}
