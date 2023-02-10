import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Outbox } from '@app/outbox/outbox.entity';
import { FindOutboxDto } from './dto/find-outbox.dto';
import { OutboxRepository } from './outbox.repository';

@Injectable()
export class OutboxService {
  constructor(private readonly outboxRepository: OutboxRepository) {}

  async findAllPaginated(searchParams: FindOutboxDto): Promise<PaginatedResult<Outbox>> {
    return this.outboxRepository.getPaginatedQueryBuilder(searchParams);
  }
}
