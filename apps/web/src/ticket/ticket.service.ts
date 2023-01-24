import { ListingStatus } from '@app/listing/listing.types';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketStatus } from '@app/ticket/ticket.types';
import { Injectable } from '@nestjs/common';
import { QrService } from '@web/redeem/qr.service';
import { In, IsNull, Not } from 'typeorm';
import { PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { FindUserTicketsDto } from './dto/find-user-tickets.dto';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(public readonly ticketRepository: TicketRepository, private readonly qrService: QrService) {}

  async findAllPaginated(searchParams: FindTicketsDto): Promise<PagingResult<Ticket>> {
    return this.ticketRepository.getPaginatedQueryBuilder(searchParams);
  }

  async findAllUserPaginated(searchParams: FindUserTicketsDto, userId: number): Promise<PagingResult<Ticket>> {
    return this.ticketRepository.getUserPaginatedQueryBuilder(searchParams, userId);
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
    return this.ticketRepository.find({
      where: [
        {
          purchaseId,
          status: In([TicketStatus.Active, TicketStatus.Creating]),
          listings: { status: Not(ListingStatus.Active) },
        },
        {
          purchaseId,
          status: In([TicketStatus.Active, TicketStatus.Creating]),
          listings: { id: IsNull() },
        },
      ],
      relations: ['listings'],
    });
  }

  async findById(ticketId: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { id: ticketId } });
  }

  async isTicketExist(uuid: string) {
    const ticket = await this.findByUuid(uuid);

    return ticket !== null;
  }
}
