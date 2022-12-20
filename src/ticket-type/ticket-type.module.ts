import { Module } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { TicketTypeController } from './ticket-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketType } from './ticket-type.entity';
import { TicketTypeRepository } from './ticket-type.repository';
import { EventExistsValidator } from './validators/event-exists.validator';
import { TicketTypeDuplicateValidator } from './validators/ticket-type-duplicate.validator';
import { TicketTypeExistsValidator } from './validators/ticket-type-exists.validator';
import { EventModule } from '@src/event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType]), EventModule],
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
