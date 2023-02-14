import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In, QueryRunner } from 'typeorm';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketTypeRepository as CommonRepository } from '@app/ticket-type/ticket-type.repository';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { EntityName, Locale } from '@app/translation/translation.types';
import { TranslationService } from '@app/translation/translation.service';

@Injectable()
export class TicketTypeRepository extends CommonRepository {
  async findSellableWithLock(queryRunner: QueryRunner, uuid: string[]): Promise<TicketType[]> {
    return queryRunner.manager
      .createQueryBuilder(TicketType, 'ticket_type')
      .setLock('pessimistic_write')
      .where({ uuid: In(uuid), saleEnabled: TicketTypeSaleStatus.Enabled })
      .andWhere('NOW() BETWEEN sale_enabled_from_date AND sale_enabled_to_date')
      .getMany();
  }

  async getPaginatedQueryBuilder(searchParams: FindTicketTypesDto, locale: Locale): Promise<PagingResult<TicketType>> {
    const queryBuilder = this.createQueryBuilder('ticket_type')
      .leftJoin('ticket_type.event', 'event')
      .leftJoinAndSelect(
        'ticket_type.translations',
        'ticketTypeTranslations',
        'ticketTypeTranslations.entity_name = :entityName AND ticketTypeTranslations.entity_id = ticket_type.id',
        { entityName: EntityName.TicketType },
      )
      .where('ticket_type.saleEnabled = :saleEnabled', { saleEnabled: TicketTypeSaleStatus.Enabled })
      .andWhere('NOW() BETWEEN sale_enabled_from_date AND sale_enabled_to_date')
      .andWhere('event.uuid = :eventUuid', { eventUuid: searchParams.eventUuid });

    const paginator = buildPaginator({
      entity: TicketType,
      alias: 'ticket_type',
      paginationKeys: ['id', searchParams.orderParam],
      query: {
        limit: searchParams.limit,
        order: searchParams.orderType,
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    const paginatedResult = await paginator.paginate(queryBuilder);

    this.mapTranslations(paginatedResult, locale);

    return paginatedResult;
  }

  async findOneBy(
    where: FindOptionsWhere<TicketType> | FindOptionsWhere<TicketType>[],
    locale: Locale = Locale.en_US,
  ): Promise<TicketType> {
    const ticketType = await this.createQueryBuilder('ticket_type')
      .where(where)
      .leftJoinAndSelect(
        'ticket_type.translations',
        'translations',
        'translations.entity_name = :entityName AND translations.entity_id = ticket_type.id',
        { entityName: EntityName.TicketType },
      )
      .getOne();

    if (ticketType) {
      this.mapTranslation(ticketType, locale);
    }

    return ticketType;
  }

  private mapTranslations(ticketTypes: PagingResult<TicketType>, locale: Locale): void {
    ticketTypes.data.forEach((ticketType) => this.mapTranslation(ticketType, locale));
  }

  private mapTranslation(ticketType: TicketType, locale: Locale) {
    TranslationService.mapEntity(ticketType, locale);
    delete ticketType.translations;
  }
}
