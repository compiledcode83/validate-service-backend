import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProducerService } from './producer.service';
import { KAFKA_PRODUCER_TOKEN } from './producer.types';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_PRODUCER_TOKEN,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService): Promise<any> => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'api-gateway-producer',
              brokers: [configService.get('kafkaProducerConfig.brokerUrl')],
            },
            consumer: {
              groupId: configService.get('kafkaProducerConfig.consumerGroup'),
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
