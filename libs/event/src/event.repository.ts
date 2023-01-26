import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventRepository extends Repository<Event> {
  constructor(public readonly dataSource: DataSource) {
    super(Event, dataSource.manager);
  }
}
