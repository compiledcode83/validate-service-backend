import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Environment } from '../../../libs/env/src/env.validator';
import { ConsumerModule } from './consumer.module';
import { EnvHelper } from '@app/env/env.helper';
import * as appConfig from './config/app.config';
import kafkaConfig from '@app/common/configs/kafka.config';

EnvHelper.verifyNodeEnv();

dotenv.config({ path: EnvHelper.getEnvFilePath() });

async function bootstrap() {
  const kafkaOptions = kafkaConfig();
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
        clientId: 'api-gateway-consumer',
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
