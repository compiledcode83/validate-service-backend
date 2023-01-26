import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { UserFilterDto } from './dto/user.filter.dto';
import { UserRepository as CommonRepository } from '@app/user/user.repository';
import { User } from '@app/user/user.entity';
import { Like } from 'typeorm';

@Injectable()
export class UserRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: UserFilterDto): Promise<PagingResult<User>> {
    const queryBuilder = this.createQueryBuilder('user').leftJoinAndMapOne(
      'user.ticketProvider',
      'user.ticketProvider',
      'ticket_provider',
    );

    if ('ticketProviderId' in searchParams) {
      queryBuilder.andWhere({ ticketProviderId: searchParams.ticketProviderId });
    }

    if ('searchText' in searchParams) {
      queryBuilder.andWhere([
        { name: Like(`%${searchParams.searchText}%`) },
        { email: Like(`%${searchParams.searchText}%`) },
      ]);
    }

    const paginator = buildPaginator({
      entity: User,
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
}
