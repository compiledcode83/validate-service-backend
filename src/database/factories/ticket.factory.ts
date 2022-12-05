import { faker } from '@faker-js/faker';
import { AppDataSource } from '@src/config/datasource';
import { Ticket } from '@src/ticket/ticket.entity';
import { Event } from '@src/event/event.entity';
import { TicketStatus } from '@src/ticket/ticket.types';
import { v4 as uuid } from 'uuid';

export class TicketFactory {
  static async create(data?: Partial<Ticket>) {
    const ticket = new Ticket();
    const event = new Event();
    ticket.uuid = uuid();
    ticket.name = faker.name.firstName();
    ticket.type = faker.random.word();
    ticket.dateStart = faker.date.future();
    ticket.contractId = faker.finance.ethereumAddress();
    ticket.ipfsUri = faker.internet.url();
    ticket.imageUrl = faker.internet.url();
    ticket.tokenId = Number(faker.random.numeric(2));
    ticket.additionalData = { seat: 10 };
    ticket.status = TicketStatus.Active;

    event.name = ticket.name;
    event.ticketType = ticket.type;
    event.ticketProviderId = data.ticketProviderId;

    const eventRepo = AppDataSource.manager.getRepository(Event);

    const savedEvent = await eventRepo.save({ ...event });
    ticket.eventId = savedEvent.id;

    return AppDataSource.manager.getRepository(Ticket).save({ ...ticket, ...data });
  }
}
