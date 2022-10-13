import { Module } from '@nestjs/common';
import { KafkaProducerProvider } from './producer.provider';
import { ProducerService } from './producer.service';

@Module({
  providers: [ProducerService, KafkaProducerProvider],
  exports: [ProducerService],
})
export class ProducerModule {}
