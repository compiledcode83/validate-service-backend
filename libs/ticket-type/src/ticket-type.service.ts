import { Injectable } from '@nestjs/common';
import { TicketTypeRepository } from './ticket-type.repository';
import { TicketType } from './ticket-type.entity';
import { QueryRunner } from 'typeorm';

@Injectable()
export class TicketTypeService {
  constructor(private readonly ticketTypeRepo: TicketTypeRepository) {}

  async findBuUuid(ticketTypeUuid: string): Promise<TicketType> {
    return this.ticketTypeRepo.findOne({ where: { uuid: ticketTypeUuid } });
  }

  async findOrCreate(
    queryRunner: QueryRunner,
    eventId: number,
    name: string,
    ticketDateStart: any,
    ticketTypeUuid: string,
    ticketDateEnd?: any,
  ): Promise<TicketType> {
    const existingTicketType = await this.ticketTypeRepo.findOne({
      where: { uuid: ticketTypeUuid, ticketDateStart, ticketDateEnd, eventId },
    });

    if (existingTicketType) {
      return existingTicketType;
    }

    const res = await this.ticketTypeRepo.save({
      name,
      ticketDateStart,
      ticketDateEnd: ticketDateEnd ? ticketDateEnd : null,
      eventId,
      uuid: ticketTypeUuid,
    });

    return res;
  }
}
