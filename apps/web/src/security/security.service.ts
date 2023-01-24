import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

@Injectable()
export class SecurityService {
  generateKeys(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    const exportedPublicKeyBuffer = publicKey.export({ type: 'pkcs1', format: 'pem' });
    const exportedPrivateKeyBuffer = privateKey.export({ type: 'pkcs1', format: 'pem' });

    return {
      publicKey: Buffer.from(exportedPublicKeyBuffer).toString('base64'),
      privateKey: Buffer.from(exportedPrivateKeyBuffer).toString('base64'),
    };
  }

  encrypt(text: string, publicKey: string): string {
    const encryptedData = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(text),
    );

    return Buffer.from(encryptedData).toString('base64');
  }

  decrypt(text: string, privateKey: string): string {
    const decryptedData = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(text, 'base64'),
    );

    return Buffer.from(decryptedData).toString();
  }
}
