import { faker } from '@faker-js/faker';
import { AppDataSource } from '@src/config/datasource';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { TicketProviderSecurityLevel } from '@src/ticket-provider/ticket-provider.types';

export class TicketProviderFactory {
  static async create(data?: Partial<TicketProvider>) {
    const ticketProvider = new TicketProvider();
    ticketProvider.name = faker.name.firstName();
    ticketProvider.email = faker.internet.email();
    ticketProvider.securityLevel = TicketProviderSecurityLevel.Level1;

    return AppDataSource.manager.getRepository(TicketProvider).save({ ...ticketProvider, ...data });
  }
}
