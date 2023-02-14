import { Event } from '@app/event/event.entity';
import { EventSubscriber } from '@app/event/event.subscriber';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventController],
  providers: [EventService, EventRepository, EventSubscriber],
  exports: [EventService],
})
export class EventModule {}
