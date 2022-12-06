import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Producer, RecordMetadata, TopicMessages } from 'kafkajs';
import { KAFKA_PRODUCER_TOKEN } from './producer.types';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProducerService.name);

  constructor(@Inject(KAFKA_PRODUCER_TOKEN) private kafka: Producer) {}

  async send(pattern: any, data: any): Promise<RecordMetadata> {
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

  async sendBatch(topicMessages: TopicMessages[]): Promise<RecordMetadata[]> {
    const responses = await this.kafka.sendBatch({
      topicMessages,
    });

    responses.forEach((response) => {
      if (response.errorCode !== 0) {
        throw new Error(`Kafka responded with an error code ${response.errorCode} for topic ${response.topicName}`);
      }
    });

    return responses;
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
