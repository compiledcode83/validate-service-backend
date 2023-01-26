import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { Listing } from '@app/listing/listing.entity';
import { CurrencyEnum } from '@app/common/types/currency.enum';

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

  @OneToMany(() => Listing, (listing) => listing.event)
  @JoinColumn({ name: 'id', referencedColumnName: 'event_id' })
  listings: Listing[];

  @ApiProperty({ description: 'Event start date', required: true, example: '2024-05-01' })
  dateStart: string;

  @ApiProperty({ description: 'Event end date', required: true, example: '2024-05-02' })
  dateEnd: string;

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
}
