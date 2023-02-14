import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindEventsDto } from './dto/find-events.dto';
import { DateTime } from 'luxon';
import { MarketType } from '@app/common/types/market-type.enum';
import { ListingStatus } from '@app/listing/listing.types';
import { Event } from '@app/event/event.entity';
import { EventRepository as CommonRepository } from '@app/event/event.repository';
import { TicketTypeSaleStatus } from '@app/ticket-type/ticket-type.types';
import { EntityName, Locale } from '@app/translation/translation.types';
import { FindOptionsWhere } from 'typeorm';
import { TranslationService } from '@app/translation/translation.service';

@Injectable()
export class EventRepository extends CommonRepository {
  async getPaginatedQueryBuilder(searchParams: FindEventsDto, locale: Locale): Promise<PagingResult<Event>> {
    const queryBuilder = this.createQueryBuilder('event').leftJoinAndSelect(
      'event.translations',
      'translations',
      'translations.entity_name = :entityName AND translations.entity_id = event.id',
      { entityName: EntityName.Event },
    );

    if (searchParams.marketType === MarketType.Secondary) {
      queryBuilder
        .leftJoin('event.listings', 'listings')
        .where('listings.status = :status', { status: ListingStatus.Active })
        .andWhere('listings.endsAt > :date', { date: DateTime.now().toISODate() });
    } else {
      queryBuilder
        .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
        .where('ticketTypes.sale_enabled = :saleEnabled', { saleEnabled: TicketTypeSaleStatus.Enabled })
        .andWhere('NOW() BETWEEN sale_enabled_from_date AND sale_enabled_to_date');
    }

    const paginator = buildPaginator({
      entity: Event,
      paginationKeys: ['id', searchParams.orderParam],
      query: {
        limit: searchParams.limit,
        order: searchParams.orderType,
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    const paginatedEvents = await paginator.paginate(queryBuilder);

    this.mapTranslations(paginatedEvents, locale);

    return paginatedEvents;
  }

  async findOneBy(
    where: FindOptionsWhere<Event> | FindOptionsWhere<Event>[],
    locale: Locale = Locale.en_US,
  ): Promise<Event> {
    const event = await this.createQueryBuilder('event')
      .where(where)
      .leftJoinAndSelect(
        'event.translations',
        'translations',
        'translations.entity_name = :entityName AND translations.entity_id = event.id',
        { entityName: EntityName.Event },
      )
      .getOne();

    if (event) {
      this.mapTranslation(event, locale);
    }

    return event;
  }

  private mapTranslations(events: PagingResult<Event>, locale: Locale): void {
    events.data.forEach((event) => this.mapTranslation(event, locale));
  }

  private mapTranslation(event: Event, locale: Locale) {
    TranslationService.mapEntity(event, locale);
    delete event.translations;
  }
}
