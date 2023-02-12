import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { UpdateTicketValidationDto } from './dto/update.ticket.validation.dto';
import { RetryTicketMinting } from './dto/retry.minting.ticket.validation.dto';
import { TicketFilterDto } from './dto/ticket.filter.dto';
import { PagingResult } from 'typeorm-cursor-pagination';
import { UserService } from '@admin/user/user.service';
import { TicketProviderService } from '@admin/ticket-provider/ticket-provider.service';
import { TicketStatus } from '@app/ticket/ticket.types';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketService as CommonTicketService } from '@app/ticket/ticket.service';
import { CreateTicketValidationDto } from './dto/create.ticket.validation.dto';
import { TicketTypeService } from '@app/ticket-type/ticket-type.service';
import { EventService } from '@admin/event/event.service';
import { Locale } from '@app/translation/translation.types';
import { TranslationService } from '@app/translation/translation.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userService: UserService,
    private readonly ticketProviderService: TicketProviderService,
    private readonly ticketTypeService: TicketTypeService,
    private readonly eventService: EventService,
    private readonly commonTicketService: CommonTicketService,
  ) {}

  async create(createTicketDto: CreateTicketValidationDto, locale: Locale) {
    const { user, ...ticketData } = createTicketDto;
    const ticketProvider = await this.ticketProviderService.findById(ticketData.ticketProviderId);
    const ticketType = await this.ticketTypeService.findByUuid(ticketData.ticketTypeUuid);
    const event = await this.eventService.findById(createTicketDto.eventId);

    return this.commonTicketService.create(ticketProvider, user, event, ticketType, ticketData, locale);
  }

  async retryMinting(retryTicketMintingDto: RetryTicketMinting): Promise<Ticket> {
    const ticket = await this.findById(retryTicketMintingDto.ticketId);
    const ticketProvier = await this.ticketProviderService.findById(retryTicketMintingDto.ticketProviderId);
    const user = await this.userService.findById(retryTicketMintingDto.userId);

    /** @todo create record in outbox table */

    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketValidationDto, locale: Locale) {
    const { ticketTypeUuid, ...updateTicketParams } = updateTicketDto;

    await this.ticketRepository.update({ id }, updateTicketParams);

    return this.findById(id);
  }

  async findAllPaginated(searchParams: TicketFilterDto, locale: Locale): Promise<PagingResult<Ticket>> {
    const ticketPaginatedResult = await this.ticketRepository.getPaginatedQueryBuilder(searchParams);

    ticketPaginatedResult.data.map((ticket) => this.mapTranslations(ticket, locale));

    return ticketPaginatedResult;
  }

  async delete(id: number) {
    const ticket = await this.findById(id);
    await this.ticketRepository.update({ id }, { status: TicketStatus.Deleted, deletedAt: new Date() });

    /** @todo create record in outbox table */

    return;
  }

  async findById(id: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { id } });
  }

  async isTicketExist(id: number): Promise<boolean> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    return ticket !== null;
  }

  private mapTranslations(ticket: Ticket, locale: Locale): void {
    TranslationService.mapEntity(ticket.ticketType, locale);
    delete ticket.ticketType.translations;
  }
}
