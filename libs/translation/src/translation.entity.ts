import { EventTranslatableAttributes } from '@app/event';
import { Event } from '@app/event/event.entity';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { TicketTypeTranslatableAttributes } from '@app/ticket-type/ticket-type.types';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EntityName, Locale } from './translation.types';

@Entity('translation')
export class Translation {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Entity name`, maximum: 64, enum: EntityName, example: EntityName.Event })
  @Column({ type: 'varchar', nullable: false, length: 64 })
  entityName: EntityName;

  @ApiProperty({ description: `Entity ID` })
  @Column({ type: 'int', nullable: false })
  entityId: number;

  @ApiProperty({ description: `Entity attribute`, maximum: 64 })
  @Column({ type: 'varchar', nullable: false, length: 64 })
  entityAttribute: EventTranslatableAttributes | TicketTypeTranslatableAttributes;

  @ApiProperty({ description: `Locale (ISO language code and ISO country code)`, enum: Locale })
  @Column({ type: 'enum', enum: Locale })
  locale: Locale;

  @ApiProperty({ description: `Translation text` })
  @Column({ type: 'text', nullable: false })
  text: string;

  @ManyToOne(() => Event, (event) => event.translations)
  @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
  event: Event;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.translations)
  @JoinColumn({ name: 'entity_id', referencedColumnName: 'id' })
  ticketType: TicketType;
}
