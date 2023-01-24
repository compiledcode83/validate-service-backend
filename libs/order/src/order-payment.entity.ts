import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Order } from './order.entity';
import { OrderPaymentStatus } from './order.types';

@Entity('order_payment')
export class OrderPayment {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  orderId: number;

  @Column({ type: 'varchar', nullable: false })
  externalId: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'json', nullable: true })
  externalData: string;

  @Column({ type: 'enum', enum: OrderPaymentStatus })
  externalStatus: OrderPaymentStatus;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;
}
