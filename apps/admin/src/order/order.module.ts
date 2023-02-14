import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from './order.repository';
import { Order } from '@app/order/order.entity';
import { OrderPrimary } from '@app/order/order-primary.entity';
import { OrderPrimaryTicket } from '@app/order/order-primary-ticket.entity';
import { OrderSecondary } from '@app/order/order-secondary.entity';
import { OrderPayment } from '@app/order/order-payment.entity';
import { TicketModule } from '@admin/ticket/ticket.module';
import { OutboxModule } from '@app/outbox/outbox.module';
import { OrderSubscriber } from '@app/order/order.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderPrimary, OrderPrimaryTicket, OrderSecondary, OrderPayment]),
    TicketModule,
    OutboxModule,
  ],
  providers: [OrderService, OrderRepository, OrderSubscriber],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
