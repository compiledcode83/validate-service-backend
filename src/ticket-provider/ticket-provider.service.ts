import { Injectable } from '@nestjs/common';
import { RepositoryFactory } from './repository.factory';
import { TicketProvider } from './ticket-provider.entity';
import { TicketProviderRepository } from './ticket-provider.repository';

@Injectable()
export class TicketProviderService {
  private ticketProviderRepository: any;

  constructor(private readonly repositoryFactory: RepositoryFactory) {
    this.ticketProviderRepository = this.repositoryFactory.createCustomRepository(
      TicketProvider,
      TicketProviderRepository,
    );
  }

  async findOne(id: number): Promise<void> {
    const res = await this.ticketProviderRepository.findById(id);

    console.log('hello');

    console.log(res);
  }
}
