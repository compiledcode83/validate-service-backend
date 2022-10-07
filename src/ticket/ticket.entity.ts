import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { TicketTransfer } from '@src/ticket-transfer/ticket-transfer.entity';
import { User } from '@src/user/user.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TicketAdditionalData, TicketStatus } from './ticket.types';

@Entity('ticket')
export class Ticket {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Ticket's unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

  @ApiProperty({ description: 'Name of the ticket', maximum: 255, minimum: 1, required: true })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  name: string;

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

  @ApiProperty({ description: 'Ticket status', example: TicketStatus.Creating, required: true })
  @Column({ type: 'enum', nullable: false, enum: TicketStatus })
  status: TicketStatus;

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.apiTokens)
  ticketProvider: TicketProvider;

  @ManyToOne(() => User, (user) => user.tickets)
  user: User;

  @OneToMany(() => TicketTransfer, (ticketTransfer) => ticketTransfer.ticket)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticket_id' })
  transfers: TicketTransfer[];
}
