/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@src/common/pagination/pagination.types';
import { EventService } from '@src/event/event.service';
import { Not } from 'typeorm';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketType } from './ticket-type.entity';
import { TicketTypeRepository } from './ticket-type.repository';

@Injectable()
export class TicketTypeService {
  constructor(
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly eventService: EventService,
  ) {}

  async findByUuid(uuid: string): Promise<TicketType> {
    return this.ticketTypeRepository.findOneBy({ uuid });
  }

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<TicketType> {
    return this.ticketTypeRepository.findOne({
      where: { uuid, event: { ticketProviderId } },
      relations: ['event'],
    });
  }

  async findByNameAndEvent(name: string, eventId: number, excludeUuid?: string): Promise<TicketType> {
    const findParams = { name, eventId };

    if (excludeUuid) {
      findParams['uuid'] = Not(excludeUuid);
    }

    return this.ticketTypeRepository.findOneBy(findParams);
  }

  async findAllPaginated(searchParams: FindTicketTypesDto): Promise<PaginatedResult<TicketType>> {
    const event = await this.eventService.findByUuid(searchParams.eventUuid);

    return this.ticketTypeRepository.getPaginatedQueryBuilder(searchParams, event.id);
  }

  async create(body: CreateTicketTypeDto): Promise<TicketType> {
    const { ticketProvider, ...ticketTypeParams } = body;
    const event = await this.eventService.findByUuid(body.eventUuid);

    return this.ticketTypeRepository.save(this.ticketTypeRepository.create({ ...ticketTypeParams, eventId: event.id }));
  }

  async update(body: UpdateTicketTypeDto): Promise<TicketType> {
    const { ticketProvider, uuid, ...ticketTypeParams } = body;

    await this.ticketTypeRepository.update(
      { uuid: body.uuid },
      this.ticketTypeRepository.create({ ...ticketTypeParams }),
    );

    return this.findByUuid(uuid);
  }
}
