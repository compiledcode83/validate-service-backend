import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { KAFKA_PRODUCER_TOKEN } from './producer.types';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(KAFKA_PRODUCER_TOKEN) private kafka: ClientKafka) {}

  emit(pattern: any, data: any): Observable<any> {
    return this.kafka.emit(pattern, data);
  }

  async onModuleInit() {
    await this.kafka.connect();
  }

  async onModuleDestroy() {
    await this.kafka.close();
  }
}
