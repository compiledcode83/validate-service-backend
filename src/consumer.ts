import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as config from './config/kafka-consumer.config';
import { ConsumerModule } from './consumer/consumer.module';

async function bootstrap() {
  const appOptions = config.default();

  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'web3-reply-consumer',
        brokers: appOptions.brokerUrl.split(','),
        ssl: appOptions.ssl,
      },
      consumer: {
        groupId: appOptions.consumerGroup,
      },
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ConsumerModule, microserviceOptions);

  app.enableShutdownHooks();
  app.listen();
}
bootstrap();
