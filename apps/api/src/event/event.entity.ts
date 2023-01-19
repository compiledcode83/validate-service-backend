import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { TicketType } from '@api/ticket-type/ticket-type.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

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

  @ApiProperty({ description: 'Description of the event', maximum: 10000, minimum: 1, required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Image URL of the event', maximum: 500, required: false })
  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Website URL of the event', maximum: 500, required: false })
  @Column({ type: 'text', nullable: true })
  websiteUrl: string;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.tickets)
  ticketProvider: TicketProvider;

  @OneToMany(() => TicketType, (ticketType) => ticketType.event)
  @JoinColumn({ name: 'id', referencedColumnName: 'event_id' })
  ticketTypes: TicketType[];
}
