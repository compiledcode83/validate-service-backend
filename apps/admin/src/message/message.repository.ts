import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { MessageRepository as CommonRepository } from '@app/message/message.repository';
import { FindMessageDto } from './dto/find-message.dto';
import { Message } from '@app/message/message.entity';

@Injectable()
export class MessageRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindMessageDto): Promise<PagingResult<Message>> {
    const queryBuilder = this.createQueryBuilder('message').leftJoinAndMapOne('message.user', 'message.user', 'user');

    if (searchParams.userPhoneNumber) {
      queryBuilder.andWhere('user.phoneNumber like :userPhoneNumber', {
        userPhoneNumber: `%${searchParams.userPhoneNumber}%`,
      });
    }

    const paginator = buildPaginator({
      entity: Message,
      paginationKeys: ['id', searchParams.orderParam],
      query: {
        limit: searchParams.limit,
        order: searchParams.orderType,
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    return paginator.paginate(queryBuilder);
  }

  async findOneMessage(uuid: string) {
    const result = await this.createQueryBuilder('message')
      .leftJoinAndMapOne('message.ticket', 'message.ticket', 'ticket')
      .leftJoinAndMapOne('message.user', 'message.user', 'user')
      .leftJoinAndMapOne('message.redeem', 'message.redeem', 'redeem')
      .where({ uuid })
      .getOne();

    return result;
  }
}
