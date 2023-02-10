import { TicketProviderEncryptionKey } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.entity';
import { TicketProviderEncryptionService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderEncryptionKeyController } from './ticket-provider-encryption-key.controller';
import { TicketProviderEncryptionKeyRepository } from './ticket-provider-encryption-key.repository';
import { TicketProviderEncryptionKeyService } from './ticket-provider-encryption-key.service';
import { TicketProviderEncryptionKeyRepository as CommonTicketProviderEncryptionKeyRepository } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.repository';
import { TicketProviderEncryptionKeyService as CommonTicketProviderEncryptionKeyService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketProviderEncryptionKey])],
  providers: [
    TicketProviderEncryptionKeyService,
    TicketProviderEncryptionService,
    TicketProviderEncryptionKeyRepository,
    CommonTicketProviderEncryptionKeyRepository,
    CommonTicketProviderEncryptionKeyService,
  ],
  controllers: [TicketProviderEncryptionKeyController],
  exports: [TicketProviderEncryptionKeyService],
})
export class TicketProviderEncryptionKeyModule {}
