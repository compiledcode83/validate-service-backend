import { Injectable } from '@nestjs/common';
import { MoreThanOrEqual, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { OrderRepository as CommonRepository } from '@app/order/order.repository';
import { Order } from '@app/order/order.entity';
import { OrderStatus } from '@app/order/order.types';
import { DateTime } from 'luxon';

@Injectable()
export class OrderRepository extends CommonRepository {
  async getManyBoughtAndReservedCount(
    queryRunner: QueryRunner,
    ticketTypeId: number[],
  ): Promise<{ [key: string]: number }> {
    const result = await queryRunner.manager
      .createQueryBuilder(Order, 'order')
      .useTransaction(true)
      .setLock('pessimistic_write')
      .leftJoin('order.primaryPurchases', 'primaryPurchases')
      .select('primaryPurchases.ticket_type_id', 'ticketTypeId')
      .addSelect('SUM(primaryPurchases.quantity)', 'ordersCount')
      .where('primaryPurchases.ticket_type_id IN (:ticketTypeId)', { ticketTypeId })
      .andWhere('(status IN (:completedStatuses) OR (status = :createdStatus AND reserved_until >= NOW()))', {
        completedStatuses: [OrderStatus.Paid, OrderStatus.Completed],
        createdStatus: OrderStatus.Created,
      })
      .groupBy('ticketTypeId')
      .getRawMany();

    if (result.length === 0) {
      return {};
    }

    return result.reduce((acc, item) => {
      acc[item.ticketTypeId] = Number(item.ordersCount);

      return acc;
    }, {});
  }

  async getOneBoughtAndReservedCount(ticketTypeId: number): Promise<number> {
    const result = await this.createQueryBuilder('order')
      .leftJoin('order.primaryPurchases', 'primaryPurchases')
      .select('primaryPurchases.ticket_type_id', 'ticketTypeId')
      .addSelect('SUM(primaryPurchases.quantity)', 'ordersCount')
      .where('primaryPurchases.ticket_type_id = :ticketTypeId', { ticketTypeId })
      .andWhere('(status IN (:completedStatuses) OR (status = :createdStatus AND reserved_until >= NOW()))', {
        completedStatuses: [OrderStatus.Paid, OrderStatus.Completed],
        createdStatus: OrderStatus.Created,
      })
      .getRawOne();

    return Number(result.ordersCount);
  }

  async findPayableOrder(uuid: string, userId: number): Promise<Order> {
    const queryBuilder = this.createQueryBuilder('order');

    this.addRelations(queryBuilder);

    return queryBuilder
      .where({
        uuid,
        buyerId: userId,
        status: OrderStatus.Created,
        reservedUntil: MoreThanOrEqual(DateTime.now().toJSDate()),
      })
      .andWhere('payment.id IS NULL')
      .getOne();
  }

  private addRelations(queryBuilder: SelectQueryBuilder<Order>): SelectQueryBuilder<Order> {
    queryBuilder
      .leftJoinAndSelect('order.primaryPurchases', 'primaryPurchases')
      .leftJoinAndSelect('order.secondaryPurchases', 'secondaryPurchases')
      .leftJoinAndSelect('primaryPurchases.tickets', 'tickets')
      .leftJoinAndSelect('primaryPurchases.ticketType', 'ticketType')
      .leftJoinAndSelect('ticketType.event', 'event')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.payment', 'payment');

    return queryBuilder;
  }
}
