import { Module } from '@nestjs/common';
import { TicketModule } from '@src/ticket/ticket.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [TicketModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
