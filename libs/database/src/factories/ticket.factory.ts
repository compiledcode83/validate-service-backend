import { faker } from '@faker-js/faker';
import { AppDataSource } from '@app/database/config/datasource';
import { Ticket } from '@api/ticket/ticket.entity';
import { Event } from '@api/event/event.entity';
import { TicketStatus } from '@api/ticket/ticket.types';
import { v4 as uuid } from 'uuid';
import { TicketTypeFactory } from './ticket-type.factory';

export class TicketFactory {
  static async create(data?: Partial<Ticket>) {
    const ticket = new Ticket();
    const event = new Event();

    ticket.uuid = uuid();
    ticket.contractId = faker.finance.ethereumAddress();
    ticket.ipfsUri = faker.internet.url();
    ticket.imageUrl = faker.internet.url();
    ticket.tokenId = Number(faker.random.numeric(2));
    ticket.additionalData = { seat: 10 };
    ticket.status = TicketStatus.Active;

    event.name = faker.random.word();
    event.ticketProviderId = data.ticketProviderId;

    const eventRepo = AppDataSource.manager.getRepository(Event);

    const savedEvent = await eventRepo.save({ ...event });
    const ticketType = await TicketTypeFactory.create({ eventId: savedEvent.id });
    ticket.eventId = savedEvent.id;
    ticket.ticketTypeId = ticketType.id;

    return AppDataSource.manager.getRepository(Ticket).save({ ...ticket, ...data });
  }
}
