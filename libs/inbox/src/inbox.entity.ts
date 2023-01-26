import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inbox')
export class Inbox {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 36 })
  operationUuid: string;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;
}
