import { Controller, Get } from '@nestjs/common';
import { ProducerService } from './producer.service';

@Controller()
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get()
  getHello(): string {
    return this.producerService.getHello();
  }
}
