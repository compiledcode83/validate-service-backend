/* eslint-disable @typescript-eslint/no-unused-vars */
import { TranslationService } from '@app/translation/translation.service';
import { EntityAttribute, EntityName, Locale } from '@app/translation/translation.types';
import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { TicketTypeRepository } from './ticket-type.repository';
import { TicketTypeTranslatableAttributes } from './ticket-type.types';

@Injectable()
export class TicketTypeService {
  constructor(
    private readonly ticketTypeRepository: TicketTypeRepository,
    private readonly translationService: TranslationService,
  ) {}

  async findByUuid(uuid: string): Promise<TicketType> {
    return this.ticketTypeRepository.findOneBy({ uuid });
  }

  async findOrCreate(
    queryRunner: QueryRunner,
    eventId: number,
    ticketProviderId: number,
    ticketTypeData: Partial<TicketType>,
    locale: Locale,
  ): Promise<TicketType> {
    const existingTicketType = await this.ticketTypeRepository
      .createQueryBuilder('ticketType')
      .where({ uuid: ticketTypeData.uuid })
      .leftJoinAndSelect('ticketType.event', 'event')
      .leftJoinAndSelect('event.ticketProvider', 'ticketProvider')
      .andWhere('ticketProvider.id = :ticketProviderId', { ticketProviderId })
      .getOne();

    if (existingTicketType) {
      return existingTicketType;
    }

    const { generatedMaps } = await queryRunner.manager
      .createQueryBuilder(TicketType, 'ticket_type')
      .insert()
      .values(this.ticketTypeRepository.create({ ...ticketTypeData, eventId }))
      .execute();
    const [insertedValues] = generatedMaps;

    await this.saveTranslations(queryRunner, insertedValues.id, ticketTypeData, locale);

    return queryRunner.manager.findOneBy(TicketType, { id: insertedValues.id });
  }

  async saveTranslations(
    queryRunner: QueryRunner,
    ticketTypeId: number,
    ticketTypeLikeDto: Partial<TicketType>,
    locale: Locale,
  ) {
    const saveTranslations: EntityAttribute[] = [];
    const eventTranslatableAttributes = Object.values<string>(TicketTypeTranslatableAttributes);

    for (const attributeName of Object.keys(ticketTypeLikeDto)) {
      if (eventTranslatableAttributes.includes(attributeName)) {
        saveTranslations.push({
          name: attributeName,
          value: ticketTypeLikeDto[attributeName],
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
