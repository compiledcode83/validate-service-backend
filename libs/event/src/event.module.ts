import { Module } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';

@Module({
  providers: [EventRepository, EventService],
  exports: [EventService],
})
export class EventModule {}
