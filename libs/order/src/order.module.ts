import { Module } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { OrderSubscriber } from './order.subscriber';

@Module({
  providers: [OrderRepository, OrderSubscriber],
})
export class OrderModule {}
