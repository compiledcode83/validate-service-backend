import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProducerService } from './producer/producer.service';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource, private readonly producerService: ProducerService) {}

  async healthCheck(): Promise<void> {
    await Promise.all([this.dataSource.query('SELECT NOW()'), this.producerService.healthCheck()]);
  }
}
