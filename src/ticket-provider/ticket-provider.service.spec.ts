import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { TicketProviderService } from './ticket-provider.service';

describe('TicketProviderService', () => {
  let service: TicketProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<TicketProviderService>(TicketProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
