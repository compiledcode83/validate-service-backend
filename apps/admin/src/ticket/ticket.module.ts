import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketProviderEncryptionKeyModule } from '@admin/ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketProviderModule } from '@admin/ticket-provider/ticket-provider.module';
import { TicketProviderValidator } from '@admin/ticket-provider/ticket-provider.validator';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { UserModule } from '@admin/user/user.module';
import { UserValidator } from '@admin/user/user.validator';
import { UserExistsValidator } from '@admin/user/validators/user-exists.validator';
import { UserExistsValidatorByIdentifier } from '@admin/user/validators/user-exists-by-identifier.validator';
import { TicketController } from './ticket.controller';
import { TicketRepository } from './ticket.repository';
import { TicketService } from './ticket.service';
import { TicketValidator } from './ticket.validator';
import { TicketExistsValidator } from './validators/ticket-exists-validator';
import { EventModule } from '@admin/event/event.module';
import { TicketTypeModule } from '../ticket-type/ticket-type.module';
import { TicketTypeService } from '../ticket-type/ticket-type.service';
import { TicketTypeRepository } from '../ticket-type/ticket-type.repository';
import { Ticket } from '@app/ticket/ticket.entity';
import { OutboxModule } from '@app/outbox/outbox.module';
import { TicketModule as CommonTicketModule } from '@app/ticket/ticket.module';

import { TicketService as CommonTicketService } from '@app/ticket/ticket.service';
import { TicketRepository as CommonTicketRepository } from '@app/ticket/ticket.repository';
import { EventService as CommonEventService } from '@app/event/event.service';
import { EventRepository as CommonEventRepository } from '@app/event/event.repository';
import { UserService } from '@app/user/user.service';
import { UserRepository } from '@app/user/user.repository';
import { TicketTypeService as CommonTicketTypeService } from '@app/ticket-type/ticket-type.service';
import { TicketTypeRepository as CommonTicketTypeRepository } from '@app/ticket-type/ticket-type.repository';
import { TicketProviderEncryptionService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.service';
import { TicketProviderEncryptionKeyRepository } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.repository';
import { TicketProviderEncryptionKeyService as CommonTicketProviderEncryptionKeyService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { TicketProviderRepository } from '@app/ticket-provider/ticket-provider.repository';
import { TicketProviderService } from '@app/ticket-provider/ticket-provider.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    UserModule,
    TicketProviderModule,
    EventModule,
    TicketProviderEncryptionKeyModule,
    TicketTypeModule,
    OutboxModule,
    CommonTicketModule,
  ],
  controllers: [TicketController],
  providers: [
    TicketService,
    TicketRepository,
    UserValidator,
    UserExistsValidator,
    UserExistsValidatorByIdentifier,
    TicketValidator,
    TicketExistsValidator,
    TicketProviderValidator,
    TicketProviderExistsValidator,
    TicketTypeService,
    TicketTypeRepository,
    CommonTicketService,
    CommonTicketRepository,
    CommonEventService,
    CommonEventRepository,
    UserService,
    UserRepository,
    TicketProviderEncryptionService,
    TicketProviderEncryptionKeyRepository,
    CommonTicketTypeService,
    CommonTicketTypeRepository,
    CommonTicketProviderEncryptionKeyService,
    TicketProviderRepository,
    TicketProviderService,
  ],
  exports: [TicketService],
})
export class TicketModule {}
