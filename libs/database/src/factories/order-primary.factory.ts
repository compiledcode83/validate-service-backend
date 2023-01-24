import { AppDataSource } from '@app/common/configs/datasource';
import { OrderPrimary } from '@app/order/order-primary.entity';

export class OrderPrimaryFactory {
  static async create(orderData?: Partial<OrderPrimary>) {
    const orderPrimary = new OrderPrimary();
    orderPrimary.quantity = 1;

    return AppDataSource.manager.getRepository(OrderPrimary).save({ ...orderPrimary, ...orderData });
  }
}
