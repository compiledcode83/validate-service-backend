import { AppDataSource } from '@app/common/configs/datasource';
import { faker } from '@faker-js/faker';
import { AuthCode } from '@web/auth/auth-code.entity';
import { DateTime } from 'luxon';
import { randomInt } from 'node:crypto';

export class AuthCodeFactory {
  static async create(data?: Partial<AuthCode>) {
    const authCode = new AuthCode();
    authCode.code = randomInt(100000, 999999);
    authCode.expireAt = DateTime.now().plus({ minutes: 60 }).toJSDate();
    authCode.userAgent = faker.internet.userAgent();
    authCode.ip = faker.internet.ip();

    return AppDataSource.manager.getRepository(AuthCode).save({ ...authCode, ...data });
  }
}
