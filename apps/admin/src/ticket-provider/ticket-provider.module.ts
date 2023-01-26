import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderEncryptionKeyModule } from '@admin/ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketProviderController } from './ticket-provider.controller';
import { TicketProviderRepository } from './ticket-provider.repository';
import { TicketProviderService } from './ticket-provider.service';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProvider]), TicketProviderEncryptionKeyModule],
  controllers: [TicketProviderController],
  providers: [TicketProviderService, TicketProviderRepository],
  exports: [TicketProviderService],
})
export class TicketProviderModule {}
