import { User } from '@app/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('user_refresh_token')
export class UserRefreshToken {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @ApiProperty({ description: 'Token', maximum: 64, required: true })
  @Column({ type: 'varchar', nullable: false, length: 64 })
  token: string;

  @ApiProperty({ description: 'User agent', maximum: 1000, required: true })
  @Column({ type: 'varchar', nullable: false, length: 1000 })
  userAgent: string;

  @ApiProperty({ description: 'Unique client fingerprint', maximum: 64, required: true })
  @Column({ type: 'varchar', nullable: false, length: 64 })
  fingerprint: string;

  @ApiProperty({ description: 'IP', maximum: 46, required: true })
  @Column({ type: 'varchar', nullable: false, length: 46 })
  ip: string;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Expire at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  expireAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}
