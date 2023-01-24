import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_code')
export class AuthCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  code: number;

  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: false })
  expireAt: Date;

  @Column({ type: 'datetime', nullable: true })
  usedAt: Date;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: false })
  ip: string;

  @Column({ type: 'varchar', nullable: false })
  userAgent: string;
}
