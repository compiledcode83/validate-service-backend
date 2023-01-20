import { TestingModule } from '@nestjs/testing';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProviderApiTokenFactory } from '@app/database/factories/ticket-provider-api-token.factory';

type JestType = typeof jest;

export class TestHelper {
  private moduleFixture: TestingModule;
  private jest: JestType;

  constructor(moduleFixture: TestingModule, jest: JestType) {
    this.moduleFixture = moduleFixture;
    this.jest = jest;
  }

  async createTicketProviderToken(ticketProviderId: number): Promise<string> {
    return (await TicketProviderApiTokenFactory.create({ ticketProviderId: ticketProviderId })).token;
  }

  async truncateTable(tableName: string): Promise<void> {
    await AppDataSource.query(`TRUNCATE TABLE ${tableName}`);
  }

  async cleanDatabase(): Promise<void> {
    await Promise.all(
      AppDataSource.entityMetadatas
        .filter((entity) => entity.tableName !== 'base_entity')
        .map((entity) => AppDataSource.query(`TRUNCATE TABLE ${entity.tableName}`)),
    );
  }
}
