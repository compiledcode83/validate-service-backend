import { CurrencyEnum } from '@app/common/types/currency.enum';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@app/user/user.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { OrderPayment } from './order-payment.entity';
import { OrderPrimary } from './order-primary.entity';
import { OrderSecondary } from './order-secondary.entity';
import { OrderMarketType, OrderStatus } from './order.types';

@Entity('order')
export class Order {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Order unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @ApiProperty({ description: 'Order market type', required: true, enum: OrderMarketType })
  @Column({ nullable: false })
  marketType: OrderMarketType;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  buyerId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  sellerId: number;

  @ApiProperty({ description: 'Order sale price', required: true })
  @Column({ type: 'decimal', nullable: true })
  salePrice: string;

  @ApiProperty({ description: 'Order currency', required: true, enum: CurrencyEnum })
  @Column({ nullable: false })
  saleCurrency: CurrencyEnum;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @ApiProperty({ description: 'Reserved until date', required: true })
  @Column({ type: 'datetime', nullable: false })
  reservedUntil: Date;

  @Column({ type: 'enum', nullable: false, enum: OrderStatus })
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.sellOrders)
  seller: User;

  @ManyToOne(() => User, (user) => user.buyOrders)
  buyer: User;

  @OneToMany(() => OrderPrimary, (orderPrimary) => orderPrimary.order)
  @JoinColumn({ name: 'id', referencedColumnName: 'orderId' })
  primaryPurchases: OrderPrimary[];

  @OneToMany(() => OrderSecondary, (orderSecondary) => orderSecondary.order)
  @JoinColumn({ name: 'id', referencedColumnName: 'orderId' })
  secondaryPurchases: OrderSecondary[];

  @OneToOne(() => OrderPayment, (orderPayment) => orderPayment.order)
  @JoinColumn({ name: 'id', referencedColumnName: 'orderId' })
  payment: OrderPayment;
}
