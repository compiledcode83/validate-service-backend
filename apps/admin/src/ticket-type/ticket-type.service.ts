/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
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
import { TicketTypeService as CommonTicketTypeService } from '@app/ticket-type/ticket-type.service';
import { Locale } from '@app/translation/translation.types';
import { TranslationService } from '@app/translation/translation.service';

@Injectable()
export class TicketTypeService {
  constructor(
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly eventService: EventService,
    private readonly outboxService: OutboxService,
    private readonly commonTicketTypeService: CommonTicketTypeService,
  ) {}

  async findByUuid(uuid: string, locale: Locale): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOneBy({ uuid });

    TranslationService.mapEntity(ticketType, locale);

    return ticketType;
  }

  async findById(id: number, locale: Locale): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOneBy({ id });

    TranslationService.mapEntity(ticketType, locale);

    return ticketType;
  }

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<TicketType> {
    return this.ticketTypeRepository.findOne({
      where: { uuid, event: { ticketProviderId } },
      relations: ['event'],
    });
  }

  async findAllPaginated(searchParams: FindTicketTypesDto): Promise<PaginatedResult<TicketType>> {
    const event = await this.eventService.findByUuid(searchParams.eventUuid);

    return this.ticketTypeRepository.getPaginatedQueryBuilder(searchParams, event.id);
  }

  async create(body: CreateTicketTypeDto, locale: Locale): Promise<TicketType> {
    const { ticketProviderId, name, description, ...ticketTypeParams } = body;
    const event = await this.eventService.findByUuid(body.eventUuid);
    const queryRunner = this.ticketTypeRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const createdTicketType = await queryRunner.manager.save(
        this.ticketTypeRepository.create({ ...ticketTypeParams, eventId: event.id }),
      );

      const ticketType = await queryRunner.manager.findOneBy(TicketType, { id: createdTicketType.id });
      await this.commonTicketTypeService.saveTranslations(queryRunner, createdTicketType.id, body, locale);

      const payload = new TicketTypeCreateMessage({ ticketType });
      await this.outboxService.create(queryRunner, TicketTypeEventPattern.Create, payload);

      await queryRunner.commitTransaction();

      return this.findByUuid(ticketType.uuid, locale);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(body: UpdateTicketTypeDto, locale: Locale): Promise<TicketType> {
    const { ticketProviderId, ticketTypeId, name, ...ticketTypeParams } = body;

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
      await this.commonTicketTypeService.saveTranslations(queryRunner, ticketTypeId, body, locale);
      const payload = new TicketTypeUpdateMessage({ ticketType: updatedTicketType });

      await this.outboxService.create(queryRunner, TicketTypeEventPattern.Update, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(updatedTicketType.uuid, locale);
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
