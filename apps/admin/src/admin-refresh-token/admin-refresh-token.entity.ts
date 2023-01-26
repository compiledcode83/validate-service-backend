import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Admin } from '@admin/admin/admin.entity';

@Entity('admin_refresh_token')
export class AdminRefreshToken {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'int', nullable: false })
  adminId: number;

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

  @ManyToOne(() => Admin, (admin) => admin.refreshTokens)
  admin: Admin;
}
