import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';
import { TicketProviderExistsValidator } from '@admin/ticket-provider/validators/ticket-provider-exists.validator';
import { TicketProviderValidator } from '@admin/ticket-provider/ticket-provider.validator';
import { TicketProviderService } from '../ticket-provider/ticket-provider.service';
import { TicketProviderRepository } from '../ticket-provider/ticket-provider.repository';
import { TicketProviderEncryptionKeyService } from '../ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { TicketProviderEncryptionKeyRepository } from '../ticket-provider-encryption-key/ticket-provider-encryption-key.repository';
import { Event } from '@app/event/event.entity';
import { TicketProviderEncryptionService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption.service';
import { EventSubscriber } from '@app/event/event.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventController],
  providers: [
    EventService,
    EventRepository,
    TicketProviderExistsValidator,
    TicketProviderValidator,
    TicketProviderService,
    TicketProviderRepository,
    TicketProviderEncryptionKeyService,
    TicketProviderEncryptionKeyRepository,
    TicketProviderEncryptionService,
    EventSubscriber
  ],
  exports: [EventService],
})
export class EventModule {}
