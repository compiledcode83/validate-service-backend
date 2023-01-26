import { ApiProperty } from '@nestjs/swagger';
import { AdminRefreshToken } from '@admin/admin-refresh-token/admin-refresh-token.entity';
import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, OneToMany, JoinColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: 'Unique uid', maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @ApiProperty({ description: 'Name', maximum: 128, required: false })
  @Column({ type: 'varchar', nullable: true, length: 128 })
  name: string;

  @ApiProperty({ description: 'E-mail', maximum: 255, required: true })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  email: string;

  @ApiProperty({ description: 'Password', required: true })
  @Column({ type: 'varchar', nullable: false, length: 12 })
  password: string;

  @ApiProperty({ description: 'Date when the user was created', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Date when user was updated the last time', required: true })
  @Column({ type: 'datetime', nullable: false })
  updatedAt: Date;

  @ApiProperty({ description: 'Date when user was deleted', required: true })
  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => AdminRefreshToken, (adminRefreshToken) => adminRefreshToken.admin)
  @JoinColumn({ name: 'id', referencedColumnName: 'admin_id' })
  refreshTokens: AdminRefreshToken[];
}
