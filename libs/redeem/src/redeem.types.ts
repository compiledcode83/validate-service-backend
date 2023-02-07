import { ApiProperty } from '@nestjs/swagger';
import { Redeem } from './redeem.entity';
import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';

export enum RedeemStatus {
  NotRedeemed = 'notRedeemed',
  Redeemed = 'redeemed',
}

export enum RedeemMode {
  Individual = 'individual',
  All = 'all',
}

export const QR_TICKET_HASH_PREFIX = 'qr:hash:ticket';
export const QR_PURCHASE_HASH_PREFIX = 'qr:hash:purchase';
export const QR_DISPLAY_PREFIX = 'qr:display';

export class QrGenerateResponse {
  @ApiProperty({ example: '11bf5b37', description: 'QR code hash' })
  qrHash: string;

  @ApiProperty({ example: 30, description: 'Current QR hash time to live (in sec)' })
  qrHashTtl: number;

  @ApiProperty({ example: 1800, description: 'The QR code display time to live (in sec)' })
  qrDisplayTtl: number;
}

export class RedeemPaginatedResult {
  @ApiProperty({ isArray: true, type: () => Redeem })
  data: Redeem[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
