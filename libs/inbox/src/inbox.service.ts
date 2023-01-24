import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbox } from './inbox.entity';

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Inbox)
    private readonly inboxRepository: Repository<Inbox>,
  ) {}

  async findByOperationUuid(operationUuid: string): Promise<Inbox> {
    return this.inboxRepository.findOneBy({ operationUuid });
  }

  async save(operationUuid: string): Promise<void> {
    await this.inboxRepository.save({ operationUuid });
  }

  async startOperation(uuid: string): Promise<boolean> {
    const alreadyStarted = await this.findByOperationUuid(uuid);

    if (alreadyStarted) {
      return false;
    }

    await this.save(uuid);

    return true;
  }
}
