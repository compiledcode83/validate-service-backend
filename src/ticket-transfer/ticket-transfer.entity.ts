import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { Ticket } from '@src/ticket/ticket.entity';
import { User } from '@src/user/user.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { TicketTransferStatus } from './ticket-transfer.types';

@Entity('ticket_transfer')
export class TicketTransfer {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Ticket transfer operation uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  userIdFrom: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  userIdTo: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Finished at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  finishedAt: Date;

  @ApiProperty({ description: 'Ticket transfer status', example: TicketTransferStatus.InProgress, required: true })
  @Column({ type: 'enum', nullable: false, enum: TicketTransferStatus })
  status: TicketTransferStatus;

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

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.apiTokens)
  ticketProvider: TicketProvider;

  @ManyToOne(() => Ticket, (ticket) => ticket.transfers)
  ticket: Ticket;

  @OneToOne(() => User, (user) => user.ticketTransfersFrom)
  userFrom: User;

  @OneToOne(() => User, (user) => user.ticketTransfersTo)
  userTo: User;
}
