import { faker } from '@faker-js/faker';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { TicketProviderSecurityLevel } from '@app/ticket-provider/ticket-provider.types';

export class TicketProviderFactory {
  static async create(data?: Partial<TicketProvider>) {
    const ticketProvider = new TicketProvider();
    ticketProvider.name = faker.name.firstName();
    ticketProvider.email = faker.internet.email();
    ticketProvider.securityLevel = TicketProviderSecurityLevel.Level1;

    return AppDataSource.manager.getRepository(TicketProvider).save({ ...ticketProvider, ...data });
  }
}
