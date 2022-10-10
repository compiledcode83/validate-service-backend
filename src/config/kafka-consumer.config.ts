import { registerAs } from '@nestjs/config';

export default registerAs('kafkaConsumerConfig', () => ({
  brokerUrl: process.env.KAFKA_CONSUMER_BROKER_URL,
  consumerGroup: process.env.KAFKA_CONSUMER_CONSUMER_GROUP,
  ssl: process.env.KAFKA_CONSUMER_SSL === 'true',
  username: process.env.KAFKA_CONSUMER_USERNAME,
  password: process.env.KAFKA_CONSUMER_PASSWORD,
}));
