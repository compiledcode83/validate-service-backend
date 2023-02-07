import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { Redeem } from '@app/redeem/redeem.entity';
import { FindRedeemDto } from './dto/find-redeem.dto';
import { RedeemRepository } from './redeem.repository';

@Injectable()
export class RedeemService {
  constructor(private readonly redeemRepository: RedeemRepository) {}

  async findAllPaginated(searchParams: FindRedeemDto): Promise<PaginatedResult<Redeem>> {
    return this.redeemRepository.getPaginatedQueryBuilder(searchParams);
  }

  async getRedeemInfo(uuid: string) {
    return this.redeemRepository.getRedeemInfo(uuid);
  }
}
