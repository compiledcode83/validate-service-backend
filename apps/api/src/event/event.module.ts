import { Event } from '@app/event/event.entity';
import { OutboxModule } from '@app/outbox/outbox.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
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
