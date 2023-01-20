import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderEncryptionKey } from './ticket-provider-encryption-key.entity';
import { TicketProviderEncryptionKeyRepository } from './ticket-provider-encryption-key.repository';
import { TicketProviderEncryptionKeyService } from './ticket-provider-encryption-key.service';
import { TicketProviderEncryptionService } from './ticket-provider-encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProviderEncryptionKey])],
  providers: [
    TicketProviderEncryptionKeyService,
    TicketProviderEncryptionService,
    TicketProviderEncryptionKeyRepository,
  ],
  exports: [TicketProviderEncryptionKeyService],
})
export class TicketProviderEncryptionKeyModule {}
