import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { OrderPrimaryTicket } from './order-primary-ticket.entity';
import { Order } from './order.entity';

@Entity('order_primary')
export class OrderPrimary {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  orderId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketTypeId: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @ManyToOne(() => Order, (order) => order.primaryPurchases)
  order: Order;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.primarySales)
  ticketType: TicketType;

  @OneToMany(() => OrderPrimaryTicket, (orderPrimaryTicket) => orderPrimaryTicket.orderPrimary)
  @JoinColumn({ name: 'id', referencedColumnName: 'orderPrimaryId' })
  tickets: OrderPrimaryTicket[];
}
