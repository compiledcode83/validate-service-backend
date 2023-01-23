import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';
import { Ticket } from '@app/ticket/ticket.entity';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserStatus } from './user.types';

@Entity('user')
export class User {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @ApiProperty({ description: 'Full name', maximum: 128, required: false })
  @Column({ type: 'varchar', nullable: true, length: 128 })
  name: string;

  @ApiProperty({ description: 'E-mail', maximum: 255, required: false })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  email: string;

  @ApiProperty({ description: 'Phone number', maximum: 255, required: true })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  phoneNumber: string;

  @ApiProperty({ description: 'Crypto wallet address', maximum: 255, required: true })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  walletAddress: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

  @ApiProperty({ description: 'Date when the user was created', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Date when user was updated the last time', required: false })
  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;

  @ApiProperty({ description: 'User status', example: UserStatus.Creating, required: true })
  @Column({ type: 'enum', nullable: false, enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ description: 'User photo url', maximum: 255, required: true })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  photoUrl: string;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  errorData: string;

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.users)
  ticketProvider: TicketProvider;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket;

  @OneToMany(() => TicketTransfer, (ticketTransfer) => ticketTransfer.userFrom)
  @JoinColumn({ name: 'id', referencedColumnName: 'user_id_from' })
  ticketTransfersFrom: TicketTransfer[];

  @OneToMany(() => TicketTransfer, (ticketTransfer) => ticketTransfer.userTo)
  @JoinColumn({ name: 'id', referencedColumnName: 'user_id_to' })
  ticketTransfersTo: TicketTransfer[];
}
