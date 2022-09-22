import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget } from 'typeorm';

@Injectable()
export class RepositoryFactory {
  constructor(private readonly dataSource: DataSource) {}

  createCustomRepository<T>(entity: EntityTarget<T>, repositoryClass?: object) {
    return this.dataSource.getRepository<T>(entity).extend(repositoryClass || {});
  }
}
