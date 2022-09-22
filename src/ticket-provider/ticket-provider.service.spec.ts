import { Test, TestingModule } from '@nestjs/testing';
import { TicketProviderService } from './ticket-provider.service';

describe('TicketProviderService', () => {
  let service: TicketProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketProviderService],
    }).compile();

    service = module.get<TicketProviderService>(TicketProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
