import { Injectable } from '@nestjs/common';
import { TicketProviderEncryptionKey } from './ticket-provider-encryption-key.entity';
import { TicketProviderEncryptionKeyRepository } from './ticket-provider-encryption-key.repository';
import { TicketProviderEncryptionService } from './ticket-provider-encryption.service';

@Injectable()
export class TicketProviderEncryptionKeyService {
  constructor(
    private readonly ticketProviderEncryptionKeyRepo: TicketProviderEncryptionKeyRepository,
    private readonly ticketProviderEncryptionService: TicketProviderEncryptionService,
  ) {}

  async findByVersion(version: number, ticketProviderId: number): Promise<TicketProviderEncryptionKey> {
    return this.ticketProviderEncryptionKeyRepo.findByVersion(version, ticketProviderId);
  }

  async create(ticketProviderId: number): Promise<TicketProviderEncryptionKey> {
    const currentVersion = await this.ticketProviderEncryptionKeyRepo.getCurrentVersion(ticketProviderId);
    const newVersion = Number(currentVersion?.version ?? 0) + 1;
    const entity: Partial<TicketProviderEncryptionKey> = {
      ticketProviderId,
      version: newVersion,
      secretKey: this.ticketProviderEncryptionService.generateSecretKey(),
    };

    const encryptionKey = await this.ticketProviderEncryptionKeyRepo.save(entity, { reload: false });

    return this.findByVersion(encryptionKey.version, ticketProviderId);
  }
}
