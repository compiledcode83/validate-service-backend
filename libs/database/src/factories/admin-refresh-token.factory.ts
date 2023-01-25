import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { AdminRefreshToken } from '@admin/admin-refresh-token/admin-refresh-token.entity';
import { AppDataSource } from '@app/common/configs/datasource';

export class AdminRefreshTokenFactory {
  static async create(data?: Partial<AdminRefreshToken>) {
    const adminRefreshToken = new AdminRefreshToken();
    adminRefreshToken.token = faker.random.alphaNumeric(64);
    adminRefreshToken.fingerprint = faker.datatype.uuid();
    adminRefreshToken.ip = faker.internet.ip();
    adminRefreshToken.userAgent = faker.internet.userAgent();
    adminRefreshToken.expireAt = DateTime.now().plus({ days: 1 }).toJSDate();

    return AppDataSource.manager.getRepository(AdminRefreshToken).save({ ...adminRefreshToken, ...data });
  }
}
