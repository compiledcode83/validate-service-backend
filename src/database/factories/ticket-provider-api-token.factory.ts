import { faker } from '@faker-js/faker';
import { AppDataSource } from '@src/config/datasource';
import { TicketProviderApiToken } from '@src/ticket-provider-api-token/ticket-provider-api-token.entity';

export class TicketProviderApiTokenFactory {
  static async create(data?: Partial<TicketProviderApiToken>) {
    const ticketProviderApiToken = new TicketProviderApiToken();
    ticketProviderApiToken.token = faker.random.word();

    return AppDataSource.manager.getRepository(TicketProviderApiToken).save({ ...ticketProviderApiToken, ...data });
  }
}
