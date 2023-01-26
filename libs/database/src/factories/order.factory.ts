import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { DateTime } from 'luxon';
import { Order } from '@app/order/order.entity';
import { OrderPrimary } from '@app/order/order-primary.entity';
import { OrderMarketType, OrderStatus, SYSTEM_SELLER } from '@app/order/order.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { AppDataSource } from '@app/common/configs/datasource';
import { OrderPrimaryTicket } from '@app/order/order-primary-ticket.entity';

export class OrderFactory {
  static async create(orderData?: Partial<Order>, orderPrimaryData?: Array<Partial<OrderPrimary>>) {
    const order = new Order();
    order.uuid = uuid();
    order.marketType = OrderMarketType.Primary;
    order.salePrice = faker.finance.amount();
    order.saleCurrency = CurrencyEnum.AED;
    order.sellerId = SYSTEM_SELLER;
    order.reservedUntil = DateTime.now().plus({ minutes: 10 }).toJSDate();
    order.status = OrderStatus.Created;

    const newOrder = await AppDataSource.manager.getRepository(Order).save({ ...order, ...orderData });

    if (orderPrimaryData.length) {
      for (const orderPrimary of orderPrimaryData) {
        await OrderFactory.createOrderPrimary({ ...orderPrimary, orderId: newOrder.id });
      }
    }

    return AppDataSource.manager.getRepository(Order).findOneBy({ uuid: newOrder.uuid });
  }

  static async createOrderPrimary(data?: Partial<OrderPrimary>) {
    const orderPrimary = new OrderPrimary();
    orderPrimary.quantity = 1;

    return AppDataSource.manager.getRepository(OrderPrimary).save({ ...orderPrimary, ...data });
  }

  static async createOrderPrimaryTicket(data?: Partial<OrderPrimaryTicket>) {
    const orderPrimaryTicket = new OrderPrimaryTicket();

    return AppDataSource.manager.getRepository(OrderPrimaryTicket).save({ ...orderPrimaryTicket, ...data });
  }
}
