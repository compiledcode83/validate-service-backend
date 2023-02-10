import { QR_DISPLAY_PREFIX, QR_PURCHASE_HASH_PREFIX, QR_TICKET_HASH_PREFIX } from '@app/redeem/redeem.types';
import { QrGenerateResponse } from '@app/redeem/types/qr-generate-response';
import { RedisService } from '@app/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';

@Injectable()
export class QrService {
  constructor(private readonly redisService: RedisService, private readonly configService: ConfigService) {}

  async generateQrForTicket(redeemUuid: string, ticketUuid: string): Promise<QrGenerateResponse> {
    const qrHash = this.getRandomString(this.configService.get('redeemConfig.redeemQrHashLength'));
    const qrHashTtl = this.configService.get('redeemConfig.redeemQrHashTtl');

    await Promise.all([
      this.redisService.set(this.getTicketHashKey(redeemUuid, ticketUuid), qrHash, qrHashTtl),
      this.redisService.set(this.getHashToTicketKey(qrHash), ticketUuid, qrHashTtl),
    ]);

    return {
      qrHash,
      qrHashTtl,
      qrDisplayTtl: this.configService.get('redeemConfig.redeemQrDisplayTtl'),
    };
  }

  async generateQrForPurchase(redeemUuid: string, purchaseId: string): Promise<QrGenerateResponse> {
    const qrHash = this.getRandomString(this.configService.get('redeemConfig.redeemQrHashLength'));
    const qrHashTtl = this.configService.get('redeemConfig.redeemQrHashTtl');

    await Promise.all([
      this.redisService.set(this.getPurchaseHashKey(redeemUuid, purchaseId), qrHash, qrHashTtl),
      this.redisService.set(this.getHashToTicketKey(qrHash), purchaseId, qrHashTtl),
    ]);

    return {
      qrHash,
      qrHashTtl,
      qrDisplayTtl: this.configService.get('redeemConfig.redeemQrDisplayTtl'),
    };
  }

  async generateDisplayToken(redeemUuid: string) {
    await this.redisService.set(
      this.getRedeemDisplayKey(redeemUuid),
      this.getRedeemDisplayKey(redeemUuid),
      this.configService.get('redeemConfig.redeemQrDisplayTtl'),
    );
  }

  async checkRedeemDisplayKeyExists(redeemUuid: string) {
    const displayToken = await this.redisService.get(this.getRedeemDisplayKey(redeemUuid));

    return Boolean(displayToken);
  }

  getTicketHashKey(redeemUuid: string, ticketUuid: string): string {
    return `${QR_TICKET_HASH_PREFIX}:${redeemUuid}:${ticketUuid}`;
  }

  getHashToTicketKey(hash: string): string {
    return hash;
  }

  getPurchaseHashKey(redeemUuid: string, purchaseId: string): string {
    return `${QR_PURCHASE_HASH_PREFIX}:${redeemUuid}:${purchaseId}`;
  }

  getHashToPurchaseKey(hash: string): string {
    return hash;
  }

  getRedeemDisplayKey(redeemUuid: string): string {
    return `${QR_DISPLAY_PREFIX}:${redeemUuid}`;
  }

  private getRandomString(length: number) {
    return randomBytes(length / 2)
      .toString('hex')
      .substring(0, length);
  }
}
