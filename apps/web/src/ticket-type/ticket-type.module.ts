import { forwardRef, Module } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTypeRepository } from './ticket-type.repository';
import { TicketTypeController } from './ticket-type.controller';
import { EventExistsValidator } from '@web/event/validators/event-exists.validator';
import { EventModule } from '@web/event/event.module';
import { OrderModule } from '@web/order/order.module';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { TicketTypeSubscriber } from '@app/ticket-type/ticket-type.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType]), EventModule, forwardRef(() => OrderModule)],
  controllers: [TicketTypeController],
  providers: [TicketTypeService, TicketTypeRepository, EventExistsValidator, TicketTypeSubscriber],
  exports: [TicketTypeService],
})
export class TicketTypeModule {}
