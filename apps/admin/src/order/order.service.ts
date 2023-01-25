import { Order } from '@app/order/order.entity';
import { OrderPaymentStatus, OrderStatus } from '@app/order/order.types';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { IsNull, MoreThanOrEqual } from 'typeorm';
import { FindOrdersDto } from './dto/find-orders.dto';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async findByUuid(uuid: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { uuid },
      relations: this.getRelations(),
    });
  }

  async findAllPaginated(searchParams: FindOrdersDto) {
    return this.orderRepository.getPaginatedQueryBuilder(searchParams);
  }

  async findByUuidAndUser(uuid: string, userId: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: [
        { buyerId: userId, uuid },
        { sellerId: userId, uuid },
      ],
      relations: this.getRelations(),
    });
  }

  async findPayableOrder(uuid: string, userId: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: {
        buyerId: userId,
        uuid,
        payment: {
          id: IsNull(),
        },
        status: OrderStatus.Created,
        reservedUntil: MoreThanOrEqual(DateTime.now().toJSDate()),
      },
      relations: this.getRelations(),
    });
  }

  async findCompletableByExternalId(externalId: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: {
        payment: {
          externalId,
          externalStatus: OrderPaymentStatus.Pending,
        },
        status: OrderStatus.Created,
      },
      relations: this.getRelations(),
    });
  }

  async getOneBoughtAndReservedCount(ticketTypeId: number): Promise<number> {
    return this.orderRepository.getOneBoughtAndReservedCount(ticketTypeId);
  }

  private getRelations(): string[] {
    return ['primaryPurchases', 'secondaryPurchases', 'primaryPurchases.tickets', 'buyer', 'seller', 'payment'];
  }
}
