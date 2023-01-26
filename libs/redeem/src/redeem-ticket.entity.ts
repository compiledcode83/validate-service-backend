import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('redeem_ticket')
export class RedeemTicket {
  @Exclude({ toPlainOnly: true })
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  redeemId: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'int', nullable: false })
  ticketId: number;
}
