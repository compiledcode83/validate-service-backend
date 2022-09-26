import { ApiProperty } from '@nestjs/swagger';
import { TicketProviderApiToken } from '@src/ticket-provider-api-token/ticket-provider-api-token.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { TicketProviderStatus } from './ticket-provider.types';

@Entity('ticket_provider')
export class TicketProvider {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ApiProperty({ description: 'Ticket provider unique uuid', maximum: 36 })
  @Column({ type: 'varchar', nullable: false, length: 36 })
  uuid: string;

  @ApiProperty({ description: 'Ticket provider name', maximum: 128, required: false })
  @Column({ type: 'varchar', nullable: true, length: 128 })
  name: string;

  @ApiProperty({ description: 'Ticket provider contact e-mail', maximum: 255, required: true })
  @Column({ type: 'varchar', nullable: false, length: 255 })
  email: string;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  updatedAt: Date;

  @ApiProperty({ description: 'Ticket provider status', example: TicketProviderStatus.Active, required: false })
  @Column({ type: 'enum', nullable: false, enum: TicketProviderStatus })
  status: TicketProviderStatus;

  @OneToMany(() => TicketProviderApiToken, (ticketProviderApiToken) => ticketProviderApiToken.ticketProvider)
  @JoinColumn({ name: 'id', referencedColumnName: 'ticket_provider_id' })
  apiTokens: TicketProviderApiToken[];
}
