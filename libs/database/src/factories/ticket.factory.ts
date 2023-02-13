import { faker } from '@faker-js/faker';
import { AppDataSource } from '@app/common/configs/datasource';
import { Ticket } from '@app/ticket/ticket.entity';
import { v4 as uuid } from 'uuid';
import { TicketStatus } from '@app/ticket/ticket.types';

export class TicketFactory {
  static async create(data?: Partial<Ticket>) {
    const ticket = new Ticket();

    ticket.uuid = uuid();
    ticket.contractId = faker.finance.ethereumAddress();
    ticket.ipfsUri = faker.internet.url();
    ticket.imageUrl = faker.internet.url();
    ticket.tokenId = Number(faker.random.numeric(2));
    ticket.additionalData = { seat: 10 };
    ticket.status = TicketStatus.Active;
    ticket.hash = uuid();
    ticket.purchaseId = uuid();
    ticket.eventId = data.eventId;
    ticket.ticketTypeId = data.ticketTypeId;

    return AppDataSource.manager.getRepository(Ticket).save({ ...ticket, ...data });
  }
}
