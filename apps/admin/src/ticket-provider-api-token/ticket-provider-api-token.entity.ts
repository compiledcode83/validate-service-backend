import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, DeleteDateColumn } from 'typeorm';

@Entity('ticket_provider_api_token')
export class TicketProviderApiToken {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'int', nullable: false })
  ticketProviderId: number;

  @ApiProperty({ description: 'Token', maximum: 64, required: true })
  @Column({ type: 'varchar', nullable: false, length: 64 })
  token: string;

  @ApiProperty({ description: 'Created at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ApiProperty({ description: 'Last used at date', required: true })
  @Column({ type: 'datetime', nullable: false })
  lastUsedAt: Date;

  @ApiProperty({ description: 'Deleted at date', required: true })
  @DeleteDateColumn({ type: 'datetime', nullable: false })
  deletedAt: Date;

  @ManyToOne(() => TicketProvider, (ticketProvider) => ticketProvider.apiTokens)
  ticketProvider: TicketProvider;
}
