import { AppDataSource } from '@app/common/configs/datasource';
import { OrderPrimaryTicket } from '@app/order/order-primary-ticket.entity';

export class OrderPrimaryTicketFactory {
  static async create(orderData?: Partial<OrderPrimaryTicket>) {
    const orderPrimaryTicket = new OrderPrimaryTicket();

    return AppDataSource.manager.getRepository(OrderPrimaryTicket).save({ ...orderPrimaryTicket, ...orderData });
  }
}
