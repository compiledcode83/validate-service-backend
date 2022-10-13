import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as kafkaConfig from './config/kafka.config';
import * as appConfig from './config/app.config';
import { ConsumerModule } from './consumer/consumer.module';
import { Environment } from './common/validators/env.validator';

async function bootstrap() {
  const kafkaOptions = kafkaConfig.default();
  const appOptions = appConfig.default();

  let saslConfig = {};

  if (appOptions.environment === Environment.Production) {
    saslConfig = {
      sasl: {
        mechanism: 'scram-sha-512',
        username: kafkaOptions.username,
        password: kafkaOptions.password,
      },
    };
  }

  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'web3-reply-consumer',
        brokers: kafkaOptions.brokerUrl.split(','),
        ssl: kafkaOptions.ssl,
        ...saslConfig,
      },
      consumer: {
        groupId: kafkaOptions.consumerGroup,
      },
      subscribe: {
        fromBeginning: false,
      },
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ConsumerModule, microserviceOptions);

  app.enableShutdownHooks();
  app.listen();
}
bootstrap();
