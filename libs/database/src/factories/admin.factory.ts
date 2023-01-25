import { faker } from '@faker-js/faker';
import { Admin } from '@admin/admin/admin.entity';
import { AppDataSource } from '@app/common/configs/datasource';

export class AdminFactory {
  static async create(data?: Partial<Admin>) {
    const admin = new Admin();
    admin.name = faker.name.firstName();
    admin.email = faker.internet.email();
    admin.password = faker.datatype.string(64);
    const adminRepo = AppDataSource.manager.getRepository(Admin);

    return await adminRepo.save({ ...admin, ...data });
  }
}
