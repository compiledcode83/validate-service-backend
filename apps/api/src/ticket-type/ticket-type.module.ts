import { Module } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { TicketTypeController } from './ticket-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTypeRepository } from './ticket-type.repository';
import { EventExistsValidator } from './validators/event-exists.validator';
import { TicketTypeDuplicateValidator } from './validators/ticket-type-duplicate.validator';
import { TicketTypeExistsValidator } from './validators/ticket-type-exists.validator';
import { EventModule } from '@api/event/event.module';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { OutboxModule } from '@app/outbox/outbox.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType]), EventModule, OutboxModule],
  providers: [
    TicketTypeService,
    TicketTypeRepository,
    EventExistsValidator,
    TicketTypeDuplicateValidator,
    TicketTypeExistsValidator,
  ],
  controllers: [TicketTypeController],
  exports: [TicketTypeService],
})
export class TicketTypeModule {}
