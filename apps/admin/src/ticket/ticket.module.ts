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
import { TicketTypeModule as CommonTicketTypeModule } from '@app/ticket-type/ticket-type.module';

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
    CommonTicketTypeModule,
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
  ],
  exports: [TicketService],
})
export class TicketModule {}
