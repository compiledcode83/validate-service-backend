import { AppDataSource } from '../configs/datasource';

export class RepositoryHelper {
  static getCustomRepository<T>(repository: { new (...args: any[]): T }): T {
    // eslint-disable-next-line new-cap
    return new repository(AppDataSource);
  }
}
