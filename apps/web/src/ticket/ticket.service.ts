import { Ticket } from '@app/ticket/ticket.entity';
import { TranslationService } from '@app/translation/translation.service';
import { Locale } from '@app/translation/translation.types';
import { Injectable } from '@nestjs/common';
import { PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { FindUserTicketsDto } from './dto/find-user-tickets.dto';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(
    public readonly ticketRepository: TicketRepository,
    private readonly translationService: TranslationService,
  ) {}

  async findAllPaginated(searchParams: FindTicketsDto, locale: Locale): Promise<PagingResult<Ticket>> {
    const ticketPaginatedResult = await this.ticketRepository.getPaginatedQueryBuilder(searchParams);

    ticketPaginatedResult.data.map((ticket) => this.mapTranslations(ticket, locale));

    return ticketPaginatedResult;
  }

  async findAllUserPaginated(
    searchParams: FindUserTicketsDto,
    userId: number,
    locale: Locale,
  ): Promise<PagingResult<Ticket>> {
    const ticketPaginatedResult = await this.ticketRepository.getUserPaginatedQueryBuilder(searchParams, userId);

    ticketPaginatedResult.data.map((ticket) => this.mapTranslations(ticket, locale));

    return ticketPaginatedResult;
  }

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string, relations?: string[]): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid }, relations });
  }

  async findAllByPurchaseId(purchaseId: string, relations?: string[]): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { purchaseId }, relations });
  }

  async findAllRedeemableByPurchaseId(purchaseId: string): Promise<Ticket[]> {
    return this.ticketRepository.findAllRedeemableByPurchaseId(purchaseId);
  }

  async findById(ticketId: number, locale: Locale): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['ticketType', 'ticketType.translations', 'ticketType.event', 'ticketType.event.translations', 'user'],
    });

    this.mapTranslations(ticket, locale);

    return ticket;
  }

  async isTicketExist(uuid: string) {
    const ticket = await this.findByUuid(uuid);

    return ticket !== null;
  }

  private mapTranslations(ticket: Ticket, locale: Locale): void {
    TranslationService.mapEntity(ticket.ticketType, locale);
    TranslationService.mapEntity(ticket.ticketType.event, locale);
    delete ticket.ticketType.translations;
    delete ticket.ticketType.event.translations;
  }
}
