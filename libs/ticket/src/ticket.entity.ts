import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';
import { User } from '@app/user/user.entity';
import { Exclude, Expose } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { TicketAdditionalData, TicketStatus } from './ticket.types';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { Listing } from '@app/listing/listing.entity';
import { Message } from '@app/message/message.entity';
import { OrderPrimaryTicket } from '@app/order/order-primary-ticket.entity';
import { Redeem } from '@app/redeem/redeem.entity';

@Entity('ticket')
export class Ticket {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Ticket's unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @ApiProperty({ description: `Ticket's hash for URL`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  hash: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

  @ApiProperty({ description: 'Ticket type ID', example: 1, required: true })
  @Column({ type: 'int', nullable: false })
  ticketTypeId: number;

  @ApiProperty({ description: 'Image of the ticket', maximum: 255, required: false })
  @Column({ type: 'varchar', nullable: true, length: 255 })
  imageUrl: string;

  @ApiProperty({
    description: 'Additional ticket data to store: event name, seat number, date, type, etc.',
    maximum: 2048,
    required: false,
    type: TicketAdditionalData,
  })
  @Column({ type: 'json', nullable: true })
  additionalData: TicketAdditionalData;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @ApiProperty({ description: 'Deleted at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;

  @ApiProperty({ description: 'Ticket validation time', required: false })
  @Column({ type: 'datetime', nullable: true })
  validatedAt: Date;

  @ApiProperty({
    description: 'Smart contract address',
    example: '0xeBA05C5521a3B81e23d15ae9B2d07524BC453561',
    required: false,
    maximum: 64,
    minimum: 32,
  })
  @Column({ type: 'varchar', nullable: true, length: 64 })
  contractId: string;

  @ApiProperty({
    description: 'Ticket token id',
    example: 10,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  tokenId: number;

  @ApiProperty({
    description: 'IPFS URI where ticket data is stored',
    example: 'https://ipfs.io/ipfs/QmaUpii41ESnUMxLJUoVcrEeXowz7RHcdTiumvrBmUvcwG?filename=metadata.json',
    required: false,
    maximum: 128,
  })
  @Column({ type: 'varchar', nullable: true, length: 128 })
  ipfsUri: string;

  @Column({ type: 'int', nullable: true })
  eventId: number;

  @ApiProperty({ description: 'Ticket status', example: TicketStatus.Creating, required: true })
  @Column({ type: 'enum', nullable: false, enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty({
    description: 'Ticket creation transaction hash',
    example: '0xeBA05C5521a3B81e23d15ae9B2d07524BC453561',
    required: false,
    maximum: 66,
  })
  @Column({ type: 'varchar', nullable: true, length: 66 })
  transactionHash: string;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  errorData: string;

  @ApiProperty({ description: 'Tickets purchase id', example: 'cbc0bd0b-cbce-4922-91c1-9e2ea5e4eff9', required: true })
  @Column({ type: 'varchar', nullable: true, length: 64 })
  purchaseId: string;

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.tickets)
  ticketProvider: TicketProvider;

  @Expose()
  @ManyToOne(() => User, (user) => user.tickets)
  user: User;

  @OneToMany(() => TicketTransfer, (ticketTransfer) => ticketTransfer.ticket)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticket_id' })
  transfers: TicketTransfer[];

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  ticketType: TicketType;

  @OneToMany(() => Listing, (listing) => listing.ticket)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticket_id' })
  listings: Listing[];

  @ManyToMany(() => Redeem, (redeem) => redeem.tickets)
  @JoinTable({ name: 'redeem_ticket' })
  redeems: Redeem[];

  @OneToMany(() => Message, (messages) => messages.ticket)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticketId' })
  messages: Message[];

  @OneToOne(() => OrderPrimaryTicket, (orderPrimaryTicket) => orderPrimaryTicket.ticket)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticketId' })
  orderPrimary: OrderPrimaryTicket;
}
