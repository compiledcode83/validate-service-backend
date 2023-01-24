import { Injectable } from '@nestjs/common';
import { IsNull, Not, UpdateResult } from 'typeorm';
import { Redeem, RedeemMode, RedeemRepository as CommonRepository, RedeemStatus } from '@app/redeem';

@Injectable()
export class RedeemRepository extends CommonRepository {
  async findByUuid(uuid: string, relations: string[] = []): Promise<Redeem> {
    return this.findOne({ where: { uuid }, relations });
  }

  async findForRedeem(uuid: string): Promise<Redeem> {
    return this.createQueryBuilder('redeem')
      .leftJoinAndSelect('redeem.tickets', 'tickets')
      .leftJoinAndSelect('tickets.ticketType', 'ticketType')
      .leftJoinAndSelect('ticketType.event', 'event')
      .where({ uuid })
      .getOne();
  }

  async findForVerify(uuid: string, code: number): Promise<Redeem> {
    return this.createQueryBuilder('redeem')
      .innerJoin('redeem.message', 'message')
      .where({ uuid, status: RedeemStatus.NotRedeemed, message: { content: code } })
      .andWhere('redeem.expire_at > NOW()')
      .getOne();
  }

  async getActivePurchaseRedeem(purchaseId: string, mode?: RedeemMode): Promise<Redeem> {
    return this.createQueryBuilder('redeem')
      .where({ purchaseId, status: RedeemStatus.NotRedeemed, mode: mode ?? Not(IsNull()) })
      .andWhere('expire_at > NOW()')
      .getOne();
  }

  async countRedeemsInLastHour(purchaseId: string): Promise<number> {
    return this.createQueryBuilder('redeem')
      .where({ purchaseId })
      .andWhere(`redeem.created_at > NOW() - interval 1 hour`)
      .getCount();
  }

  async useRedeem(uuid: string): Promise<UpdateResult> {
    return this.update({ uuid }, { status: RedeemStatus.Redeemed });
  }
}
