import { faker } from '@faker-js/faker';
import { AppDataSource } from '@app/database/config/datasource';
import { User } from '@api/user/user.entity';
import { UserStatus } from '@api/user/user.types';

export class UserFactory {
  static async create(data?: Partial<User>) {
    const user = new User();
    user.name = faker.name.firstName();
    user.email = faker.internet.email();
    user.phoneNumber = faker.phone.number('+1907#######').toString();
    user.walletAddress = faker.finance.ethereumAddress();
    user.status = UserStatus.Active;

    return AppDataSource.manager.getRepository(User).save({ ...user, ...data });
  }
}
