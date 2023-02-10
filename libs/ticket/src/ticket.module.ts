import { Module } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { UserExistsByUuidValidator } from '@app/user/validator/user-exists-by-uuid.validator';
import { UserService } from '@app/user/user.service';
import { UserRepository } from '@app/user/user.repository';
import { TicketService } from './ticket.service';
import { UserModule } from '@app/user/user.module';
import { EventService } from '@app/event/event.service';
import { EventRepository } from '@app/event/event.repository';
import { TicketTypeService } from '@app/ticket-type/ticket-type.service';
import { TicketTypeRepository } from '@app/ticket-type/ticket-type.repository';
import { TicketProviderEncryptionKeyService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { TicketProviderEncryptionKeyRepository } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.repository';
import { TicketProviderEncryptionService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.service';
import { OutboxService } from '@app/outbox/outbox.service';
import { OutboxRepository } from '@app/outbox/outbox.repository';
import { TicketProviderRepository } from '@app/ticket-provider/ticket-provider.repository';
import { TicketProviderService } from '@app/ticket-provider/ticket-provider.service';

@Module({
  imports: [UserModule],
  providers: [
    TicketRepository,
    UserExistsByUuidValidator,
    UserService,
    UserRepository,
    TicketService,
    EventService,
    EventRepository,
    TicketTypeService,
    TicketTypeRepository,
    TicketProviderEncryptionKeyService,
    TicketProviderEncryptionService,
    TicketProviderEncryptionKeyRepository,
    OutboxService,
    OutboxRepository,
    TicketProviderRepository,
    TicketProviderService,
  ],
})
export class TicketModule {}
