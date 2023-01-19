import { Module } from '@nestjs/common';
import { TicketProviderEncryptionKeyService } from './ticket-provider-encryption-key.service';

@Module({
  providers: [TicketProviderEncryptionKeyService],
  exports: [TicketProviderEncryptionKeyService],
})
export class TicketProviderEncryptionKeyModule {}
