import { Message } from '@app/message/message.entity';
import { Ticket } from '@app/ticket/ticket.entity';
import { User } from '@app/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { RedeemMode, RedeemStatus } from './redeem.types';

@Entity('redeem')
export class Redeem {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: `Redeem unique uuid`, maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  userId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: false })
  ip: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Expire at date', required: false })
  @Column({ type: 'datetime', nullable: true })
  expireAt: Date;

  @ApiProperty({ description: 'Redeem status', example: RedeemStatus.NotRedeemed, required: true })
  @Column({ type: 'enum', nullable: false, enum: RedeemStatus })
  status: RedeemStatus;

  @ApiProperty({ description: 'Purchase ID', example: 'cbc0bd0b-cbce-4922-91c1-9e2ea5e4eff9', required: false })
  @Column({ type: 'varchar', nullable: true, length: 64 })
  purchaseId: string;

  @ApiProperty({ description: 'Redeem mode', example: RedeemMode.Individual, required: true })
  @Column({ type: 'enum', enum: RedeemMode })
  mode: RedeemMode;

  @ManyToMany(() => Ticket, (ticket) => ticket.redeems)
  @JoinTable({ name: 'redeem_ticket' })
  tickets: Ticket[];

  @ManyToOne(() => User, (user) => user.tickets)
  user: User;

  @OneToOne(() => Message, (message) => message.redeem)
  message: Message;
}
