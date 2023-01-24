import { AppDataSource } from '@app/common/configs/datasource';
import { OrderPayment } from '@app/order/order-payment.entity';
import { OrderPaymentStatus } from '@app/order/order.types';

export class OrderPaymentFactory {
  static async create(orderData?: Partial<OrderPayment>) {
    const orderPayment = new OrderPayment();
    orderPayment.externalStatus = OrderPaymentStatus.Pending;

    return AppDataSource.manager.getRepository(OrderPayment).save({ ...orderPayment, ...orderData });
  }
}
