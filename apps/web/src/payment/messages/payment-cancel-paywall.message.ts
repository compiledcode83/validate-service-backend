import { Order } from '@app/order/order.entity';
import { v4 as uuid } from 'uuid';

export class PaymentCancelPaywallMessage {
  operationUuid: string;
  order: Order;

  constructor(data: Partial<PaymentCancelPaywallMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
