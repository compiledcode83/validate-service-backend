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