import { ApiProperty } from '@nestjs/swagger';
import { TicketProvider } from '@api/ticket-provider/ticket-provider.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity('ticket_provider_refresh_token')
export class TicketProviderRefreshToken {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

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

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.refreshTokens)
  ticketProvider: TicketProvider;
}
