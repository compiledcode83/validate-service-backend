export enum OrderMarketType {
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum OrderStatus {
  Created = 'created',
  Paid = 'paid',
  Completed = 'completed',
  Canceled = 'canceled',
}

export const SYSTEM_SELLER = 0;

export enum OrderPaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Declined = 'declined',
  Error = 'error',
}
