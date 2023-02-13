import { Injectable } from '@nestjs/common';
import { buildPaginator, PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { FindUserTicketsDto } from './dto/find-user-tickets.dto';
import { RedeemStatus } from '@app/redeem/redeem.types';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketStatus } from '@app/ticket/ticket.types';
import { ListingStatus } from '@app/listing/listing.types';
import { DataSource, Repository } from 'typeorm';
import { EntityName } from '@app/translation/translation.types';

@Injectable()
export class TicketRepository extends Repository<Ticket> {
  constructor(public readonly dataSource: DataSource) {
    super(Ticket, dataSource.manager);
  }

  async getPaginatedQueryBuilder(searchParams: FindTicketsDto): Promise<PagingResult<Ticket>> {
    const queryBuilder = this.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.redeems', 'redeems', 'redeems.expire_at > NOW() AND redeems.status = :redeemStatus', {
        redeemStatus: RedeemStatus.NotRedeemed,
      })
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .leftJoinAndSelect('ticketType.event', 'event')
      .leftJoinAndSelect(
        'ticketType.translations',
        'ticketTypeTranslations',
        'ticketTypeTranslations.entity_name = :ticketTypeEntityName AND ticketTypeTranslations.entity_id = ticketType.id',
        { ticketTypeEntityName: EntityName.TicketType },
      )
      .leftJoinAndSelect(
        'event.translations',
        'eventTranslations',
        'eventTranslations.entity_name = :eventEntityName AND eventTranslations.entity_id = event.id',
        { eventEntityName: EntityName.Event },
      )
      .where({ purchaseId: searchParams.purchaseId });

    const paginator = buildPaginator({
      entity: Ticket,
      alias: 'ticket',
      paginationKeys: ['id', searchParams.orderParam],
      query: {
        limit: searchParams.limit,
        order: searchParams.orderType,
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    return paginator.paginate(queryBuilder);
  }

  async getUserPaginatedQueryBuilder(searchParams: FindUserTicketsDto, userId?: number): Promise<PagingResult<Ticket>> {
    const queryBuilder = this.createQueryBuilder('ticket').where({ userId });

    const paginator = buildPaginator({
      entity: Ticket,
      paginationKeys: ['id', searchParams.orderParam],
      query: {
        limit: searchParams.limit,
        order: searchParams.orderType,
        afterCursor: searchParams.afterCursor,
        beforeCursor: searchParams.beforeCursor,
      },
    });

    return paginator.paginate(queryBuilder);
  }

  async findAllRedeemableByPurchaseId(purchaseId: string): Promise<Ticket[]> {
    return this.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.listings', 'listings')
      .where('ticket.purchaseId = :purchaseId AND ticket.status IN (:statuses) AND listings.status != :listingStatus', {
        purchaseId,
        statuses: [TicketStatus.Active, TicketStatus.Creating],
        listingStatus: ListingStatus.Active,
      })
      .orWhere('ticket.purchaseId = :purchaseId AND ticket.status IN (:statuses) AND listings.id IS NULL', {
        purchaseId,
        statuses: [TicketStatus.Active, TicketStatus.Creating],
      })
      .getMany();
  }
}
