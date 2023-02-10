/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Not, QueryRunner } from 'typeorm';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketTypeRepository } from './ticket-type.repository';
import { EventService } from '@api/event/event.service';
import { OutboxService } from '@app/outbox/outbox.service';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { TicketTypeCreateMessage } from '@app/ticket-type/messages/ticket-type-create.message';
import { TicketTypeEventPattern } from '@app/ticket-type/ticket-type.types';
import { TicketTypeUpdateMessage } from '@app/ticket-type/messages/ticket-type-update.message';
import { TicketTypeService as CommonTicketTypeService } from '@app/ticket-type/ticket-type.service';

@Injectable()
export class TicketTypeService extends CommonTicketTypeService {
  constructor(
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly eventService: EventService,
    private readonly outboxService: OutboxService,
  ) {
    super(ticketTypeRepository);
  }

  async findByUuid(uuid: string): Promise<TicketType> {
    return this.ticketTypeRepository.findOneBy({ uuid });
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

  async findAllPaginated(searchParams: FindTicketTypesDto, locale: Locale): Promise<PaginatedResult<TicketType>> {
    const event = await this.eventService.findByUuid(searchParams.eventUuid, locale);

    return this.ticketTypeRepository.getPaginatedQueryBuilder(searchParams, event.id);
  }

  async create(body: CreateTicketTypeDto, locale: Locale): Promise<TicketType> {
    const { ticketProvider, ...ticketTypeParams } = body;
    const event = await this.eventService.findByUuid(body.eventUuid, locale);
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

  async update(body: UpdateTicketTypeDto, locale: Locale): Promise<TicketType> {
    const { ticketProvider, uuid, ...ticketTypeParams } = body;

    const queryRunner = this.ticketTypeRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager
        .createQueryBuilder(TicketType, 'ticket_type')
        .update(TicketType)
        .where({ uuid })
        .set({ ...ticketTypeParams })
        .execute();

      const updatedTicketType = await queryRunner.manager.findOneBy(TicketType, { uuid });
      const payload = new TicketTypeUpdateMessage({ ticketType: updatedTicketType });

      await this.outboxService.create(queryRunner, TicketTypeEventPattern.Update, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
