import { Module } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { TicketTypeController } from './ticket-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTypeRepository } from './ticket-type.repository';
import { EventExistsValidator } from './validators/event-exists.validator';
import { TicketTypeDuplicateValidator } from './validators/ticket-type-duplicate.validator';
import { TicketTypeExistsValidator } from './validators/ticket-type-exists.validator';
import { EventModule } from '../event/event.module';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { OutboxModule } from '@app/outbox/outbox.module';
import { OutboxService } from '@app/outbox/outbox.service';
import { OutboxRepository } from '@app/outbox/outbox.repository';
import { TicketTypeModule as CommonTicketTypeModule } from '@app/ticket-type/ticket-type.module';
import { TicketTypeSubscriber } from '@app/ticket-type/ticket-type.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType]), EventModule, OutboxModule, CommonTicketTypeModule],
  providers: [
    TicketTypeService,
    TicketTypeRepository,
    EventExistsValidator,
    TicketTypeDuplicateValidator,
    TicketTypeExistsValidator,
    OutboxService,
    OutboxRepository,
    TicketTypeSubscriber,
  ],
  controllers: [TicketTypeController],
  exports: [TicketTypeService],
})
export class TicketTypeModule {}
