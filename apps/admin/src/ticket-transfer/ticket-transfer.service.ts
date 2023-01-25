import { Injectable } from '@nestjs/common';
import { TicketService } from '@admin/ticket/ticket.service';
import { CreateTicketTransferDto } from './dto/create-ticket-transfer.dto';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { PagingResult } from 'typeorm-cursor-pagination';
import { TicketTransferFilterDto } from './dto/ticket-transfer.filter.dto';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';

@Injectable()
export class TicketTransferService {
  constructor(
    private readonly ticketTransferRepository: TicketTransferRepository,
    private readonly ticketService: TicketService,
  ) {}

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findById(id: number): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateTicketTransferDto): Promise<TicketTransfer> {
    const ticket = await this.ticketService.findById(createDto.ticketId);
    const entity: Partial<TicketTransfer> = {
      ticketProviderId: createDto.ticketProviderId,
      ticketId: ticket.id,
      userIdFrom: ticket.userId,
      userIdTo: createDto.userId,
    };

    const transfer = await this.ticketTransferRepository.save(entity);

    return this.findById(transfer.id);
  }

  async findAllPaginated(searchParams: TicketTransferFilterDto): Promise<PagingResult<TicketTransfer>> {
    return this.ticketTransferRepository.getPaginatedQueryBuilder(searchParams);
  }
}
