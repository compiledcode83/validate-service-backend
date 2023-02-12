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
import { TicketTypeEventPattern, TicketTypeTranslatableAttributes } from '@app/ticket-type/ticket-type.types';
import { TicketTypeUpdateMessage } from '@app/ticket-type/messages/ticket-type-update.message';
import { EntityAttribute, EntityName, Locale } from '@app/translation/translation.types';
import { TranslationService } from '@app/translation/translation.service';

@Injectable()
export class TicketTypeService {
  constructor(
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly eventService: EventService,
    private readonly outboxService: OutboxService,
    private readonly translationService: TranslationService,
  ) {}

  async findByUuid(uuid: string, locale: Locale): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOneBy({ uuid });

    TranslationService.mapEntity(ticketType, locale);

    return ticketType;
  }

  async findByUuidAndTicketProvider(uuid: string, ticketProviderId: number): Promise<TicketType> {
    return this.ticketTypeRepository.findOne({
      where: { uuid, event: { ticketProviderId } },
      relations: ['event'],
    });
  }

  async findAllPaginated(searchParams: FindTicketTypesDto, locale: Locale): Promise<PaginatedResult<TicketType>> {
    const event = await this.eventService.findByUuid(searchParams.eventUuid, locale);

    const ticketTypePaginated = await this.ticketTypeRepository.getPaginatedQueryBuilder(searchParams, event.id);

    ticketTypePaginated.data.map((ticketType) => TranslationService.mapEntity(ticketType, locale));

    return ticketTypePaginated;
  }

  async create(body: CreateTicketTypeDto, locale: Locale): Promise<TicketType> {
    const { ticketProvider, name, description, ...ticketTypeParams } = body;
    const event = await this.eventService.findByUuid(body.eventUuid, locale);
    const queryRunner = this.ticketTypeRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const createdTicketType = await queryRunner.manager.save(
        this.ticketTypeRepository.create({ ...ticketTypeParams, eventId: event.id }),
      );
      const ticketType = await queryRunner.manager.findOneBy(TicketType, { id: createdTicketType.id });
      await this.saveTranslations(queryRunner, createdTicketType.id, body, locale);

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
    const { ticketProvider, uuid, name, description, ...ticketTypeParams } = body;

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
      await this.saveTranslations(queryRunner, updatedTicketType.id, body, locale);

      await this.outboxService.create(queryRunner, TicketTypeEventPattern.Update, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(uuid, locale);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async saveTranslations(
    queryRunner: QueryRunner,
    ticketTypeId: number,
    dto: CreateTicketTypeDto | UpdateTicketTypeDto,
    locale: Locale,
  ) {
    const saveTranslations: EntityAttribute[] = [];
    const eventTranslatableAttributes = Object.values<string>(TicketTypeTranslatableAttributes);

    for (const attributeName of Object.keys(dto)) {
      if (eventTranslatableAttributes.includes(attributeName)) {
        saveTranslations.push({
          name: attributeName,
          value: dto[attributeName],
        });
      }
    }

    await this.translationService.saveTranslations(
      queryRunner,
      EntityName.TicketType,
      ticketTypeId,
      saveTranslations,
      locale,
    );
  }
}
