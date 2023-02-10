import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { EncryptedData, SECRET_KEY_LENGTH } from './ticket-provider-encryption.types';

@Injectable()
export class TicketProviderEncryptionService {
  private algorithm = 'aes-256-ctr';

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
}
