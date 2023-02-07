import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { RedeemRepository as CommonRepository } from '@app/redeem/redeem.repository';
import { FindRedeemDto } from './dto/find-redeem.dto';
import { Redeem } from '@app/redeem/redeem.entity';

@Injectable()
export class RedeemRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindRedeemDto): Promise<PagingResult<Redeem>> {
    const queryBuilder = this.createQueryBuilder('redeem').leftJoinAndMapOne('redeem.user', 'redeem.user', 'user');

    if (searchParams.userPhoneNumber) {
      queryBuilder.andWhere('user.phoneNumber like :userPhoneNumber', {
        userPhoneNumber: `%${searchParams.userPhoneNumber}%`,
      });
    }

    const paginator = buildPaginator({
      entity: Redeem,
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

  async getRedeemInfo(uuid: string) {
    const result = await this.createQueryBuilder('message')
      .leftJoinAndMapOne('message.user', 'message.user', 'user')
      .where({ uuid })
      .getOne();

    return result;
  }
}
