import { Redeem } from '@app/redeem/redeem.entity';
import { Ticket } from '@app/ticket/ticket.entity';
import { User } from '@app/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { MessageStatus, MessageType, MessageChannel } from './message.types';

@Entity('message')
export class Message {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Message unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @Column({ type: 'int', nullable: true })
  redeemId: number;

  @Column({ type: 'int', nullable: true })
  ticketId: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ApiProperty({ description: 'Message type', example: MessageType.RedeemCode, required: true })
  @Column({ type: 'enum', nullable: false, enum: MessageType })
  type: MessageType;

  @ApiProperty({ description: 'Message channel', example: MessageChannel.SMS, required: true })
  @Column({ type: 'enum', nullable: false, enum: MessageChannel })
  channel: MessageChannel;

  @ApiProperty({ description: 'Message content', example: '123456', required: true })
  @Column({ type: 'text', nullable: true })
  content: string;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @ApiProperty({ description: 'Message status', example: MessageStatus.Created, required: true })
  @Column({ type: 'enum', nullable: false, enum: MessageStatus })
  status: MessageStatus;

  @Exclude()
  @Column({ type: 'json', nullable: true })
  errorData: string;

  @ApiProperty({
    description: 'Message Receiver',
    required: false,
    example: 'example@example.com',
  })
  @Column({ type: 'varchar', nullable: true, length: 500 })
  sendTo: string;

  @ApiProperty({ description: 'Purchase ID', example: 'cbc0bd0b-cbce-4922-91c1-9e2ea5e4eff9', required: false })
  @Column({ type: 'varchar', nullable: true, length: 64 })
  purchaseId: string;

  @OneToOne(() => Redeem, (redeem) => redeem.message)
  @JoinColumn({ name: 'redeem_id', referencedColumnName: 'id' })
  redeem: Redeem;

  @OneToOne(() => Ticket, (ticket) => ticket.messages)
  @JoinColumn({ name: 'ticket_id', referencedColumnName: 'id' })
  ticket: Ticket;

  @OneToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
