import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Producer, RecordMetadata } from 'kafkajs';
import { KAFKA_PRODUCER_TOKEN } from './producer.types';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProducerService.name);

  constructor(@Inject(KAFKA_PRODUCER_TOKEN) private kafka: Producer) {}

  async emit(pattern: any, data: any): Promise<RecordMetadata> {
    const [response] = await this.kafka.send({
      topic: pattern,
      messages: [
        {
          value: JSON.stringify(data),
        },
      ],
    });

    if (response.errorCode !== 0) {
      throw new Error();
    }

    return response;
  }

  async healthCheck() {
    await this.kafka.send({
      topic: 'healthcheck',
      messages: [
        {
          value: JSON.stringify({ timestamp: new Date(), client: 'api-gateway' }),
        },
      ],
    });
  }

  async onModuleInit() {
    await this.kafka.connect();
    this.logger.log('Kafka producer connected successfully');
  }

  async onModuleDestroy() {
    await this.kafka.disconnect();
    this.logger.log('Kafka producer disconnected successfully');
  }
}
