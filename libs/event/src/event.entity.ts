import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { Listing } from '@app/listing/listing.entity';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { EventWeekday } from './event.types';
import { Translation } from '@app/translation/translation.entity';
import { Translatable } from '@app/translation/translation.types';

@Entity('event')
export class Event implements Translatable {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Event unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

  @ApiProperty({ description: 'Image URL of the event', maximum: 500, required: false })
  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Website URL of the event', maximum: 500, required: false })
  @Column({ type: 'text', nullable: true })
  websiteUrl: string;

  @ApiProperty({ description: 'Event start date', required: true, example: '2024-05-01' })
  @Column({ type: 'date', nullable: true })
  dateStart: string;

  @ApiProperty({ description: 'Event end date', required: true, example: '2024-05-02' })
  @Column({ type: 'date', nullable: true })
  dateEnd: string;

  @ApiProperty({ description: 'Name of the location of the event', maximum: 512, minimum: 1, required: false })
  @Column({ type: 'varchar', nullable: true, length: 512 })
  locationName: string;

  @ApiProperty({ description: 'URL of the location of the event', maximum: 255, minimum: 1, required: false })
  @Column({ type: 'varchar', nullable: true, length: 255 })
  locationUrl: string;

  @ApiProperty({ description: 'Event start time in 24h format', required: false, example: '18:00' })
  @Column({ type: 'time', nullable: true })
  timeStart: string;

  @ApiProperty({
    description: 'Weekday of the event',
    required: false,
    enum: EventWeekday,
    example: EventWeekday.Friday,
  })
  @Column({ type: 'enum', nullable: true, enum: EventWeekday })
  weekday: EventWeekday;

  @ApiProperty({ description: 'Event Twitter URL', maximum: 255, minimum: 1, required: false })
  @Column({ type: 'varchar', nullable: true, length: 255 })
  socialTwitter: string;

  @ApiProperty({ description: 'Event Instagram URL', maximum: 255, minimum: 1, required: false })
  @Column({ type: 'varchar', nullable: true, length: 255 })
  socialInstagram: string;

  @ApiProperty({ description: 'Event Facebook URL', maximum: 255, minimum: 1, required: false })
  @Column({ type: 'varchar', nullable: true, length: 255 })
  socialFacebook: string;

  @ApiProperty({
    description: 'Additional event information in a free form',
    required: false,
    example: [
      { header: 'Entrance rules', text: 'Lorem ipsum' },
      { header: 'Alcohol rules', text: 'Lorem ipsum' },
    ],
  })
  @Column({ type: 'json', nullable: true })
  info: object;

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

  @OneToMany(() => Listing, (listing) => listing.event)
  @JoinColumn({ name: 'id', referencedColumnName: 'event_id' })
  listings: Listing[];

  @Exclude()
  @OneToMany(() => Translation, (translation) => translation.event)
  @JoinColumn({ name: 'id', referencedColumnName: 'entity_id' })
  translations: Translation[];

  @ApiProperty({
    description: 'Starting ticket prices for the event',
    required: true,
    example: {
      primary: {
        amount: '100.00',
        currency: CurrencyEnum.AED,
      },
      secondary: {
        amount: '150.00',
        currency: CurrencyEnum.AED,
      },
    },
  })
  ticketsInformation: {
    primary: {
      startingPrice: {
        amount: string;
        currency: CurrencyEnum;
      };
    };
    secondary: {
      startingPrice: {
        amount: string;
        currency: CurrencyEnum;
      };
    };
  };

  @ApiProperty({ description: 'Name of the event', maximum: 255, minimum: 1, required: true })
  name: string = null;

  @ApiProperty({ description: 'Short description of the event', maximum: 512, minimum: 1, required: true })
  shortDescription: string = null;

  @ApiProperty({ description: 'Long description of the event', maximum: 10000, minimum: 1, required: true })
  longDescription: string = null;
}
