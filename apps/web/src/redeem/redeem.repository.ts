import { Injectable } from '@nestjs/common';
import { IsNull, Not, UpdateResult } from 'typeorm';
import { RedeemMode, RedeemStatus } from '@app/redeem/redeem.types';
import { Redeem } from '@app/redeem/redeem.entity';
import { RedeemRepository as CommonRepository } from '@app/redeem/redeem.repository';
import { EntityName } from '@app/translation/translation.types';

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
      .leftJoinAndSelect(
        'ticketType.translations',
        'ticketTypeTranslations',
        'ticketTypeTranslations.entity_name = :ticketTypeEntityName AND ticketTypeTranslations.entity_id = ticketType.id',
        { ticketTypeEntityName: EntityName.TicketType },
      )
      .leftJoinAndSelect(
        'event.translations',
        'eventTranslations',
        'eventTranslations.entity_name = :eventEntityName AND eventTranslations.entity_id = event.id',
        { eventEntityName: EntityName.Event },
      )
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
