import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { AppDataSource } from '@app/common/configs/datasource';
import { TicketType } from '@app/ticket-type/ticket-type.entity';

export class TicketTypeFactory {
  static async create(data?: Partial<TicketType>) {
    const ticketType = new TicketType();
    ticketType.uuid = uuid();
    ticketType.ticketDateStart = faker.date.future();
    ticketType.ticketDateEnd = faker.date.future();

    return AppDataSource.manager.getRepository(TicketType).save({ ...ticketType, ...data });
  }
}
