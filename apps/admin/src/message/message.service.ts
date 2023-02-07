import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Message } from '@app/message/message.entity';
import { FindMessageDto } from './dto/find-message.dto';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async findAllPaginated(searchParams: FindMessageDto): Promise<PaginatedResult<Message>> {
    return this.messageRepository.getPaginatedQueryBuilder(searchParams);
  }

  async getMessageInfo(uuid: string) {
    return this.messageRepository.getMessageInfo(uuid);
  }
}
