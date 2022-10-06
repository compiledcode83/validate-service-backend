import { faker } from '@faker-js/faker';
import { AppDataSource } from '@src/config/datasource';
import { TicketProviderEncryptionKey } from '@src/ticket-provider-encryption-key/ticket-provider-encryption-key.entity';
import { SECRET_KEY_LENGTH } from '@src/ticket-provider-encryption-key/ticket-provider-encryption.types';

export class TicketProviderEncryptionKeyFactory {
  static async create(data?: Partial<TicketProviderEncryptionKey>) {
    const ticketProviderEncryptionKey = new TicketProviderEncryptionKey();
    ticketProviderEncryptionKey.secretKey = faker.random.alphaNumeric(SECRET_KEY_LENGTH);

    return AppDataSource.manager
      .getRepository(TicketProviderEncryptionKey)
      .save({ ...ticketProviderEncryptionKey, ...data });
  }
}
