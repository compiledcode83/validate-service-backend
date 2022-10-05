import { Test, TestingModule } from '@nestjs/testing';
import { TicketProviderEncryptionKeyService } from './ticket-provider-encryption-key.service';

describe('TicketProviderEncryptionKeyService', () => {
  let service: TicketProviderEncryptionKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketProviderEncryptionKeyService],
    }).compile();

    service = module.get<TicketProviderEncryptionKeyService>(TicketProviderEncryptionKeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
