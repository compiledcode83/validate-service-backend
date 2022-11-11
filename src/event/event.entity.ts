import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { EventResaleStatus } from './event.types';

@Entity('event')
export class Event {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Event unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

  @ApiProperty({ description: 'Name of the event', maximum: 255, minimum: 1, required: true })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  name: string;

  @ApiProperty({ description: 'Type of the ticket', maximum: 64, minimum: 1, required: true })
  @Column({ type: 'varchar', nullable: false, length: 64 })
  ticketType: string;

  @ApiProperty({ description: 'Is resale enabled', example: EventResaleStatus.Disabled, required: true })
  @Column({ type: 'tinyint', default: EventResaleStatus.Disabled })
  resaleEnabled: EventResaleStatus;

  @ApiProperty({ description: 'Enable resale from date', required: true })
  @Column({ type: 'datetime', nullable: true })
  resaleEnabledFromDate: Date;

  @ApiProperty({ description: 'Enable resale until date', required: true })
  @Column({ type: 'datetime', nullable: true })
  resaleEnabledToDate: Date;

  @ApiProperty({ description: 'Resale min price', required: true })
  @Column({ type: 'decimal', nullable: true })
  resaleMinPrice: number;

  @ApiProperty({ description: 'Resale max price', required: true })
  @Column({ type: 'decimal', nullable: true })
  resaleMaxPrice: number;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.tickets)
  ticketProvider: TicketProvider;
}
