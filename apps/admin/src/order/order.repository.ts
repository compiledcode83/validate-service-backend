import { Injectable } from '@nestjs/common';
import { QueryRunner, Brackets } from 'typeorm';
import { FindOrdersDto } from './dto/find-orders.dto';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { OrderRepository as CommonRepository } from '@app/order/order.repository';
import { Order } from '@app/order/order.entity';
import { OrderStatus } from '@app/order/order.types';

@Injectable()
export class OrderRepository extends CommonRepository {
  async getBoughtAndReservedCount(
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

  async getPaginatedQueryBuilder(searchParams: FindOrdersDto) {
    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndMapOne('order.payment', 'order.payment', 'payment')
      .leftJoinAndMapOne('order.seller', 'order.seller', 'seller')
      .leftJoinAndMapOne('order.buyer', 'order.buyer', 'buyer');

    if (searchParams.paymentStatus) {
      queryBuilder.andWhere('payment.externalStatus = :paymentStatus', { paymentStatus: searchParams.paymentStatus });
    }
    if (searchParams.orderStatus) {
      queryBuilder.andWhere('order.status = :orderStatus', { orderStatus: searchParams.orderStatus });
    }
    if (searchParams.marketType) {
      queryBuilder.andWhere('order.marketType = :marketType', { marketType: searchParams.marketType });
    }
    if (searchParams.paymentExternalId) {
      queryBuilder.andWhere('payment.externalId like :paymentExternalId', {
        paymentExternalId: `%${searchParams.paymentExternalId}%`,
      });
    }
    if (searchParams.buyerInputValue) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('buyer.phoneNumber like :buyerInputValue', {
            buyerInputValue: `%${searchParams.buyerInputValue}%`,
          }).orWhere('buyer.email like :buyerInputValue', {
            buyerInputValue: `%${searchParams.buyerInputValue}%`,
          });
        }),
      );
    }

    const paginator = buildPaginator({
      entity: Order,
      paginationKeys: ['id', searchParams.orderParam],
      query: {
        limit: searchParams.limit,
        order: searchParams.orderType,
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    return paginator.paginate(queryBuilder);
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
