import { registerAs } from '@nestjs/config';

export default registerAs('kafkaProducerConfig', () => ({
  brokerUrl: process.env.KAFKA_PRODUCER_BROKER_URL,
  consumerGroup: process.env.KAFKA_PRODUCER_CONSUMER_GROUP,
  ssl: process.env.KAFKA_SSL === 'true',
}));
