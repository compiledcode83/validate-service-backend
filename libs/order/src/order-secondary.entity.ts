import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_secondary')
export class OrderSecondary {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  orderId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  listingId: number;

  @ManyToOne(() => Order, (order) => order.secondaryPurchases)
  order: Order;
}
