import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Admin } from './admin.entity';

@Injectable()
export class AdminRepository extends Repository<Admin> {
  constructor(public readonly dataSource: DataSource) {
    super(Admin, dataSource.manager);
  }

  async findById(id: number) {
    return this.findOne({ where: { id } });
  }
}
