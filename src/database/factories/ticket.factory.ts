import { faker } from '@faker-js/faker';
import { AppDataSource } from '@src/config/datasource';
import { Ticket } from '@src/ticket/ticket.entity';
import { TicketStatus } from '@src/ticket/ticket.types';
import { v4 as uuid } from 'uuid';

export class TicketFactory {
  static async create(data?: Partial<Ticket>) {
    const ticket = new Ticket();
    ticket.uuid = uuid();
    ticket.name = faker.name.firstName();
    ticket.contractId = faker.finance.ethereumAddress();
    ticket.ipfsUri = faker.internet.url();
    ticket.imageUrl = faker.internet.url();
    ticket.tokenId = Number(faker.random.numeric(2));
    ticket.additionalData = { seat: 10 };
    ticket.status = TicketStatus.Active;

    return AppDataSource.manager.getRepository(Ticket).save({ ...ticket, ...data });
  }
}
