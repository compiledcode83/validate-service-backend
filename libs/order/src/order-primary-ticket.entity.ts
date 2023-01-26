import { Ticket } from '@app/ticket/ticket.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { OrderPrimary } from './order-primary.entity';

@Entity('order_primary_ticket')
export class OrderPrimaryTicket {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  orderPrimaryId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketId: number;

  @OneToOne(() => Ticket, (ticket) => ticket.orderPrimary)
  ticket: Ticket;

  @ManyToOne(() => OrderPrimary, (orderPrimary) => orderPrimary.tickets)
  orderPrimary: OrderPrimary;
}
