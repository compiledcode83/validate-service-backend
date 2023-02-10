import { Test, TestingModule } from '@nestjs/testing';
import { TicketProviderEncryptionService } from './ticket-provider-encryption.service';
import { faker } from '@faker-js/faker';
import { TicketProviderEncryptionKeyRepository } from './ticket-provider-encryption-key.repository';

describe('TicketProviderEncryptionService', () => {
  let service: TicketProviderEncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketProviderEncryptionService, TicketProviderEncryptionKeyRepository],
    }).compile();

    service = module.get<TicketProviderEncryptionService>(TicketProviderEncryptionService);
  });

  it.skip('should encrypt and decrypt the data', () => {
    const data = {
      seats: 2,
      type: faker.random.word(),
      longText: faker.random.words(8),
    };
    const secretKey = faker.datatype.string(32);
    const json = JSON.stringify(data);

    const encryptedData = service.encrypt(json, secretKey);

    expect(encryptedData).toEqual(
      expect.objectContaining({
        iv: expect.any(String),
        content: expect.any(String),
      }),
    );

    const decryptedData = service.decrypt(encryptedData, secretKey);

    expect(decryptedData).toEqual(json);
  });
});
