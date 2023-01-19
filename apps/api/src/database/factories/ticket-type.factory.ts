import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { AppDataSource } from '@src/config/datasource';
import { TicketType } from '@src/ticket-type/ticket-type.entity';

export class TicketTypeFactory {
  static async create(data?: Partial<TicketType>) {
    const ticketType = new TicketType();
    ticketType.uuid = uuid();
    ticketType.name = faker.name.firstName();
    ticketType.ticketDateStart = faker.date.future();
    ticketType.ticketDateEnd = faker.date.future();

    return AppDataSource.manager.getRepository(TicketType).save({ ...ticketType, ...data });
  }
}
