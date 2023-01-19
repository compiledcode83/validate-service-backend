import { DateTime } from 'luxon';
import { faker } from '@faker-js/faker';
import { AppDataSource } from '@app/database/config/datasource';
import { TicketProviderRefreshToken } from '@api/ticket-provider-refresh-token/ticket-provider-refresh-token.entity';

export class TicketProviderRefreshTokenFactory {
  static async create(data?: Partial<TicketProviderRefreshToken>) {
    const ticketProviderRefreshToken = new TicketProviderRefreshToken();
    ticketProviderRefreshToken.token = faker.random.alphaNumeric(64);
    ticketProviderRefreshToken.fingerprint = faker.datatype.uuid();
    ticketProviderRefreshToken.ip = faker.internet.ip();
    ticketProviderRefreshToken.userAgent = faker.internet.userAgent();
    ticketProviderRefreshToken.expireAt = DateTime.now().plus({ days: 1 }).toJSDate();

    return AppDataSource.manager
      .getRepository(TicketProviderRefreshToken)
      .save({ ...ticketProviderRefreshToken, ...data });
  }
}
