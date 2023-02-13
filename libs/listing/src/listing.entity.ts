import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ListingStatus } from './listing.types';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { Event } from '@app/event/event.entity';
import { Ticket } from '@app/ticket/ticket.entity';

@Entity('listing')
export class Listing {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ example: 'cbc0bd0b-cbce-4922-91c1-9e2ea5e4eff9', description: `Ticket's unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @ApiProperty({ description: 'Related Ticket', required: true })
  @Column({ nullable: false })
  ticketId: number;

  @ApiProperty({ description: 'Related Ticket', required: true })
  @Column({ nullable: true })
  eventId: number;

  @ApiProperty({ description: 'Related User', required: true })
  @Column({ nullable: false })
  userId: number;

  @ApiProperty({ description: 'Bought Price', required: true })
  @Column({ nullable: false })
  buyNowPrice: string;

  @ApiProperty({ description: 'Bought Currency', required: true, enum: CurrencyEnum })
  @Column({ nullable: false })
  buyNowCurrency: CurrencyEnum;

  @ApiProperty({
    description: 'Listing Status',
    required: true,
    enum: ListingStatus,
  })
  @Column({ nullable: false })
  status: ListingStatus;

  @ApiProperty({ description: 'Market Type', required: true })
  @Column({ nullable: false })
  marketType: string;

  @ApiProperty({ description: 'End Time', required: true })
  @Column({ type: 'datetime', nullable: false })
  endsAt: Date;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.listings)
  event: Event;

  @ManyToOne(() => Ticket, (ticket) => ticket.listings)
  ticket: Ticket;
}
