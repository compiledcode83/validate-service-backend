import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@api/user/user.module';
import { TicketUserExistsAndActiveValidator } from './validators/ticket-user-exists-and-active.validator';
import { TicketIsValidatableValidator } from './validators/ticket-is-validatable.validator';
import { TicketIsDeletableValidator } from './validators/ticket-is-deletable.validator';
import { RedisModule } from '@app/redis/redis.module';
import { TicketTypeModule } from '@api/ticket-type/ticket-type.module';
import { TicketRepository } from './ticket.repository';
import { EventModule } from '@api/event/event.module';
import { Ticket } from '@app/ticket/ticket.entity';
import { OutboxModule } from '@app/outbox/outbox.module';
import { TicketProviderEncryptionKeyModule } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.module';
import { TicketService as CommonTicketService } from '@app/ticket/ticket.service';
import { TicketModule as CommonTicketModule } from '@app/ticket/ticket.module';
import { TicketRepository as CommonTicketRepository } from '@app/ticket/ticket.repository';
import { EventService as CommonEventService } from '@app/event/event.service';
import { EventRepository as CommonEventRepository } from '@app/event/event.repository';
import { UserService } from '@app/user/user.service';
import { UserRepository } from '@app/user/user.repository';
import { TicketTypeService } from '@app/ticket-type/ticket-type.service';
import { TicketTypeRepository } from '@app/ticket-type/ticket-type.repository';
import { TicketProviderEncryptionService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.service';
import { TicketProviderEncryptionKeyRepository } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.repository';
import { TicketProviderModule } from '@app/ticket-provider/ticket-provider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    UserModule,
    EventModule,
    RedisModule,
    OutboxModule,
    TicketTypeModule,
    TicketProviderEncryptionKeyModule,
    CommonTicketModule,
    TicketProviderModule,
  ],
  providers: [
    TicketService,
    TicketRepository,
    TicketUserExistsAndActiveValidator,
    TicketIsValidatableValidator,
    TicketIsDeletableValidator,
    CommonTicketService,
    CommonTicketRepository,
    CommonEventService,
    CommonEventRepository,
    UserService,
    UserRepository,
    TicketTypeRepository,
    TicketTypeService,
    TicketProviderEncryptionService,
    TicketProviderEncryptionKeyRepository,
  ],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
