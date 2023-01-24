import { AppDataSource } from '@app/common/configs/datasource';
import { RedeemTicket } from '@app/redeem/redeem-ticket.entity';

export class RedeemTicketFactory {
  static async create(data?: Partial<RedeemTicket>) {
    const redeemTicket = new RedeemTicket();

    return AppDataSource.manager.getRepository(RedeemTicket).save({ ...redeemTicket, ...data });
  }
}
