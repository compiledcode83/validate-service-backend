import { Module } from '@nestjs/common';
import { TicketProviderEncryptionKeyController } from './ticket-provider-encryption-key.controller';
import { TicketProviderEncryptionKeyModule as CommonModule } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.module';

@Module({
  imports: [CommonModule],
  controllers: [TicketProviderEncryptionKeyController],
})
export class TicketProviderEncryptionKeyModule {}
