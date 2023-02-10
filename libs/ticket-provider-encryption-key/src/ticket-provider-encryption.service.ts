import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { TicketProviderEncryptionKey } from './ticket-provider-encryption-key.entity';
import { EncryptedData, SECRET_KEY_LENGTH } from './ticket-provider-encryption.types';
import { TicketProviderEncryptionKeyRepository } from './ticket-provider-encryption-key.repository';
import { User } from '@app/user/user.entity';

@Injectable()
export class TicketProviderEncryptionService {
  private algorithm = 'aes-256-ctr';

  constructor(private readonly ticketProviderEncryptionKeyRepo: TicketProviderEncryptionKeyRepository) {}

  encrypt(plainText: string, secretKey: string): Omit<EncryptedData, 'version'> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    };
  }

  decrypt(encryptedData: Omit<EncryptedData, 'version'>, secretKey: string): string {
    const { iv, content } = encryptedData;
    const decipher = createDecipheriv(this.algorithm, secretKey, Buffer.from(iv, 'hex'));
    const decrpytedData = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);

    return decrpytedData.toString();
  }

  generateSecretKey(): string {
    return randomBytes(SECRET_KEY_LENGTH / 2)
      .toString('hex')
      .substring(0, SECRET_KEY_LENGTH);
  }

  async encryptTicketUserData(user: User): Promise<EncryptedData> {
    const data = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoUrl: user.photoUrl,
    };

    const currentEncryptionKey = await this.findCurrentVersion(user.ticketProviderId);

    if (!currentEncryptionKey) {
      throw new Error('Ticket provider does not have an ecryption key');
    }

    return {
      ...this.encrypt(JSON.stringify(data), currentEncryptionKey.secretKey),
      version: currentEncryptionKey.version,
    };
  }

  async findCurrentVersion(ticketProviderId: number): Promise<TicketProviderEncryptionKey> {
    const currentVersion = await this.ticketProviderEncryptionKeyRepo.getCurrentVersion(ticketProviderId);

    return this.findByVersion(currentVersion?.version ?? 1, ticketProviderId);
  }

  async findByVersion(version: number, ticketProviderId: number): Promise<TicketProviderEncryptionKey> {
    return this.ticketProviderEncryptionKeyRepo.findByVersion(version, ticketProviderId);
  }
}
