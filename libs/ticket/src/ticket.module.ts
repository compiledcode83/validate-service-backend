import { EventModule } from '@app/event/event.module';
import { OutboxModule } from '@app/outbox/outbox.module';
import { TicketProviderEncryptionKeyModule } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketTypeModule } from '@app/ticket-type/ticket-type.module';
import { UserModule } from '@app/user/user.module';
import { Module } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './ticket.service';

@Module({
  imports: [UserModule, TicketTypeModule, EventModule, OutboxModule, TicketProviderEncryptionKeyModule],
  providers: [TicketRepository, TicketService],
  exports: [TicketService],
})
export class TicketModule {}
