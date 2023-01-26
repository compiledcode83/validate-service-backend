import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { DateTime } from 'luxon';
import { Redeem } from '@app/redeem/redeem.entity';
import { RedeemMode, RedeemStatus } from '@app/redeem/redeem.types';
import { AppDataSource } from '@app/common/configs/datasource';

export class RedeemFactory {
  static async create(data?: Partial<Redeem>) {
    const redeem = new Redeem();
    redeem.uuid = uuid();
    redeem.expireAt = DateTime.now().plus({ minutes: 10 }).toJSDate();
    redeem.userAgent = faker.internet.userAgent();
    redeem.ip = faker.internet.ip();
    redeem.status = RedeemStatus.NotRedeemed;
    redeem.mode = RedeemMode.Individual;

    return AppDataSource.manager.getRepository(Redeem).save({ ...redeem, ...data });
  }
}
