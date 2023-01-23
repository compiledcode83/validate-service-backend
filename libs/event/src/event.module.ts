import { Module } from '@nestjs/common';
import { EventRepository } from './event.repository';

@Module({
  providers: [EventRepository],
})
export class EventModule {}
