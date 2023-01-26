/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { Not } from 'typeorm';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketTypeRepository } from './ticket-type.repository';
import { OutboxService } from '@app/outbox/outbox.service';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { TicketTypeEventPattern } from '@app/ticket-type/ticket-type.types';
import { TicketTypeCreateMessage } from '@app/ticket-type/messages/ticket-type-create.message';
import { TicketTypeUpdateMessage } from '@app/ticket-type/messages/ticket-type-update.message';

@Injectable()
export class TicketTypeService {
  constructor(
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly eventService: EventService,
    private readonly outboxService: OutboxService,
  ) {}

  async findByUuid(uuid: string): Promise<TicketType> {
    return this.ticketTypeRepository.findOneBy({ uuid });
  }

  async findById(id: number): Promise<TicketType> {
    return this.ticketTypeRepository.findOneBy({ id });
  }

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<TicketType> {
    return this.ticketTypeRepository.findOne({
      where: { uuid, event: { ticketProviderId } },
      relations: ['event'],
    });
  }

  async findByNameAndEvent(
    name: string,
    eventId: number,
    ticketDateStart: any,
    ticketDateEnd: any,
    excludeUuid?: string,
  ): Promise<TicketType> {
    const findParams = { name, eventId, ticketDateStart, ticketDateEnd: ticketDateEnd ?? null };

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
    const { ticketProviderId, ...ticketTypeParams } = body;
    const event = await this.eventService.findByUuid(body.eventUuid);
    const queryRunner = this.ticketTypeRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const createdTicketType = await queryRunner.manager.save(
        this.ticketTypeRepository.create({ ...ticketTypeParams, eventId: event.id }),
      );
      const ticketType = await queryRunner.manager.findOneBy(TicketType, { id: createdTicketType.id });

      const payload = new TicketTypeCreateMessage({ ticketType });
      await this.outboxService.create(queryRunner, TicketTypeEventPattern.Create, payload);

      await queryRunner.commitTransaction();

      return this.findByUuid(ticketType.uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(body?: UpdateTicketTypeDto): Promise<TicketType> {
    const { ticketProviderId, ticketTypeId, ...ticketTypeParams } = body;

    const queryRunner = this.ticketTypeRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager
        .createQueryBuilder(TicketType, 'ticket_type')
        .update(TicketType)
        .where({ id: ticketTypeId })
        .set({ ...ticketTypeParams })
        .execute();

      const updatedTicketType = await queryRunner.manager.findOneBy(TicketType, { id: ticketTypeId });
      const payload = new TicketTypeUpdateMessage({ ticketType: updatedTicketType });

      await this.outboxService.create(queryRunner, TicketTypeEventPattern.Update, payload);
      await queryRunner.commitTransaction();

      return this.ticketTypeRepository.findOneBy({ id: ticketTypeId });
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOrCreate(
    eventId: number,
    name: string,
    ticketDateStart: any,
    ticketDateEnd?: any,
    saleAmount?: number,
    saleStartFromDate?: any,
    saleEndDate?: any,
  ): Promise<TicketType> {
    const existingTicketType = await this.ticketTypeRepository.findOneBy({
      name,
      ticketDateStart,
      ticketDateEnd,
      eventId,
    });

    if (existingTicketType) {
      return existingTicketType;
    }

    return this.ticketTypeRepository.save({
      name,
      ticketDateStart,
      ticketDateEnd,
      eventId,
      saleEnabled: saleStartFromDate ? 1 : 0,
      saleEnabledToDate: saleEndDate ? saleEndDate : null,
      saleEnabledFromDate: saleStartFromDate ? saleStartFromDate : null,
      saleAmount: saleStartFromDate ? saleAmount : 0,
    });
  }
}
