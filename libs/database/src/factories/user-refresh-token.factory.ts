import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { UserRefreshToken } from '@web/user-refresh-token/user-refresh-token.entity';
import { AppDataSource } from '@app/common/configs/datasource';

export class UserRefreshTokenFactory {
  static async create(data?: Partial<UserRefreshToken>) {
    const userRefreshToken = new UserRefreshToken();
    userRefreshToken.token = faker.random.alphaNumeric(64);
    userRefreshToken.fingerprint = faker.datatype.uuid();
    userRefreshToken.ip = faker.internet.ip();
    userRefreshToken.userAgent = faker.internet.userAgent();
    userRefreshToken.expireAt = DateTime.now().plus({ days: 1 }).toJSDate();

    return AppDataSource.manager.getRepository(UserRefreshToken).save({ ...userRefreshToken, ...data });
  }
}
