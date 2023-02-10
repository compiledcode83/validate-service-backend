import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '@app/ticket/ticket.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TicketTypeResaleStatus, TicketTypeSaleStatus } from './ticket-type.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { Event } from '@app/event/event.entity';
import { OrderPrimary } from '@app/order/order-primary.entity';
import { Translatable } from '@app/translation/translation.types';
import { Translation } from '@app/translation/translation.entity';

@Entity('ticket_type')
export class TicketType implements Translatable {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Event unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  eventId: number;

  @ApiProperty({
    description: 'Name of the ticket type',
    example: 'VIP ticket',
    maximum: 255,
    minimum: 1,
    required: true,
  })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  name: string;

  @ApiProperty({
    description: 'Description of the ticket type',
    example: 'Premium feeling',
    maximum: 255,
    minimum: 1,
    required: true,
  })
  @Column({ type: 'varchar', nullable: true, length: 255 })
  description: string;

  @ApiProperty({ description: 'Ticket date start', required: true })
  @Column({ type: 'date', nullable: true })
  ticketDateStart: Date;

  @ApiProperty({ description: 'Ticket date end', required: false })
  @Column({ type: 'date', nullable: true })
  ticketDateEnd: Date;

  @ApiProperty({ description: 'Is sale enabled', example: TicketTypeSaleStatus.Disabled, required: true })
  @Column({ type: 'tinyint', default: TicketTypeSaleStatus.Disabled })
  saleEnabled: number;

  @ApiProperty({ description: 'Ticket primary sales start date', required: false })
  @Column({ type: 'datetime', nullable: true })
  saleEnabledFromDate: Date;

  @ApiProperty({ description: 'Ticket primary sales end date', required: false })
  @Column({ type: 'datetime', nullable: true })
  saleEnabledToDate: Date;

  @ApiProperty({ description: 'Amount of tickets available for sale', example: 1000, required: false })
  @Column({ type: 'int', default: 0 })
  saleAmount: number;

  @ApiProperty({ description: 'Sale price', required: true })
  @Column({ type: 'decimal', nullable: true })
  salePrice: string;

  @ApiProperty({ description: 'Sale currency', required: true, enum: CurrencyEnum })
  @Column({ nullable: false, type: 'enum', enum: CurrencyEnum })
  saleCurrency: CurrencyEnum;

  @ApiProperty({ description: 'Is resale enabled', example: TicketTypeResaleStatus.Disabled, required: true })
  @Column({ type: 'tinyint', default: TicketTypeResaleStatus.Disabled })
  resaleEnabled: number;

  @ApiProperty({ description: 'Enable resale from date', required: true })
  @Column({ type: 'datetime', nullable: true })
  resaleEnabledFromDate: Date;

  @ApiProperty({ description: 'Enable resale until date', required: true })
  @Column({ type: 'datetime', nullable: true })
  resaleEnabledToDate: Date;

  @ApiProperty({ description: 'Resale min price', required: true })
  @Column({ type: 'decimal', nullable: true })
  resaleMinPrice: string;

  @ApiProperty({ description: 'Resale max price', required: true })
  @Column({ type: 'decimal', nullable: true })
  resaleMaxPrice: string;

  @ApiProperty({ description: 'Resale currency', required: true, enum: CurrencyEnum })
  @Column({ nullable: false, type: 'enum', enum: CurrencyEnum })
  resaleCurrency: CurrencyEnum;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.ticketTypes)
  event: Event;

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticket_type_id' })
  tickets: Ticket[];

  @OneToMany(() => OrderPrimary, (orderPrimary) => orderPrimary.ticketType)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticketTypeId' })
  primarySales: OrderPrimary[];

  @Exclude()
  @OneToMany(() => Translation, (translation) => translation.ticketType)
  @JoinColumn({ name: 'id', referencedColumnName: 'entity_id' })
  translations: Translation[];

  @ApiProperty({ example: 10 })
  saleAmountAvailable: number;
}
