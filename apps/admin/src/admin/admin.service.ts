import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async findByEmail(email: string): Promise<Admin> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<Admin> {
    return this.adminRepository.findById(id);
  }

  async setPassword(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    await this.adminRepository.update({ email }, { password: passwordHash });
  }
}
