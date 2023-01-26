import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import { ProducerService } from './producer.service';
import { ProducerModule } from './producer.module';
import { EnvHelper } from '@app/env/env.helper';
import { TestHelper } from '@app/common/helpers/test.helper';
import { OutboxFactory } from '@app/database/factories/outbox.factory';
import { TicketEventPattern } from '@app/ticket/ticket.types';
import { faker } from '@faker-js/faker';
import { OutboxStatus } from '@app/outbox/outbox.types';
import { Outbox } from '@app/outbox/outbox.entity';
import { AppDataSource } from '@app/common/configs/datasource';

EnvHelper.verifyNodeEnv();

dotenv.config({ path: EnvHelper.getEnvFilePath() });

describe('ProducerService', () => {
  let service: ProducerService;
  let testHelper: TestHelper;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProducerModule],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
    jest.spyOn(service, 'sendBatch');

    testHelper = new TestHelper(module, jest);

    await AppDataSource.initialize();
  });

  afterAll(async () => {
    jest.resetAllMocks().restoreAllMocks();
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
    await service.client.connect();
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await service.client.disconnect();
  });

  it('should read empty outbox table and send nothing', async () => {
    const messages = await service.produceMessages();

    expect(messages).toEqual([]);
  });

  it('should read outbox table with 5 records and send them in 1 go', async () => {
    const [firstItem, secondItem] = await OutboxFactory.createMany(2, {
      eventName: TicketEventPattern.TicketCreate,
      payload: JSON.stringify({ attribute: faker.random.word() }),
      status: OutboxStatus.Created,
    });
    const messages = await service.produceMessages();

    expect(messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          topic: firstItem.eventName,
          messages: [
            {
              value: firstItem.payload,
            },
          ],
        }),
        expect.objectContaining({
          topic: secondItem.eventName,
          messages: [
            {
              value: secondItem.payload,
            },
          ],
        }),
      ]),
    );

    expect(service.sendBatch).toHaveBeenCalledWith(messages);

    const [outboxRecordOne, ourboxRecordTwo] = await AppDataSource.manager.getRepository(Outbox).find({});

    expect(outboxRecordOne.status).toBe(OutboxStatus.Sent);
    expect(outboxRecordOne.sentAt).not.toBeNull();
    expect(ourboxRecordTwo.status).toBe(OutboxStatus.Sent);
    expect(ourboxRecordTwo.sentAt).not.toBeNull();
  });
});
