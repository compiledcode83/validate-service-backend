import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { OrderRepository as CommonRepository } from '@app/order/order.repository';
import { Order } from '@app/order/order.entity';
import { OrderStatus } from '@app/order/order.types';

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
}
