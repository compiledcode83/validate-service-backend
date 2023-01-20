import { Test, TestingModule } from '@nestjs/testing';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';

describe('ProducerController', () => {
  let producerController: ProducerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProducerController],
      providers: [ProducerService],
    }).compile();

    producerController = app.get<ProducerController>(ProducerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(producerController.getHello()).toBe('Hello World!');
    });
  });
});
