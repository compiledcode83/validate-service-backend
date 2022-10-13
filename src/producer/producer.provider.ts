import { ConfigService } from '@nestjs/config';
import { Environment } from '@src/common/validators/env.validator';
import { Kafka, logLevel, Producer, Partitioners } from 'kafkajs';
import { KAFKA_PRODUCER_TOKEN } from './producer.types';

export const KafkaProducerProvider = {
  provide: KAFKA_PRODUCER_TOKEN,
  useFactory: async (configService: ConfigService): Promise<Producer> => {
    const kafka = new Kafka({
      logLevel: logLevel.INFO,
      brokers: configService.get('kafkaProducerConfig.brokerUrl').split(','),
      clientId: 'api-gateway-producer',
      ssl: configService.get<boolean>('kafkaProducerConfig.ssl'),
      ...(configService.get('appConfig.environment') === Environment.Production
        ? {
            sasl: {
              mechanism: 'scram-sha-512',
              username: configService.get('kafkaProducerConfig.username'),
              password: configService.get('kafkaProducerConfig.password'),
            },
          }
        : {}),
      retry: {
        initialRetryTime: 500,
        retries: 3,
      },
    });

    return kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
      allowAutoTopicCreation: false,
      transactionTimeout: 10000,
    });
  },
  inject: [ConfigService],
};
