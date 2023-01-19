import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from '@api/outbox/outbox.module';
import { EventController } from './event.controller';
import { Event } from './event.entity';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';
import { EventDuplicateValidator } from './validators/event-duplicate.validator';
import { EventExistsValidator } from './validators/event-exists.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), OutboxModule],
  controllers: [EventController],
  providers: [EventService, EventRepository, EventDuplicateValidator, EventExistsValidator],
  exports: [EventService],
})
export class EventModule {}
