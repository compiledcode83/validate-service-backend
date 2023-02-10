import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { CreateTicketValidationDto } from './dto/create.ticket.validation.dto';
import { UpdateTicketValidationDto } from './dto/update.ticket.validation.dto';
import { RetryTicketMinting } from './dto/retry.minting.ticket.validation.dto';
import { TicketFilterDto } from './dto/ticket.filter.dto';
import { PagingResult } from 'typeorm-cursor-pagination';
import { UserService } from '@admin/user/user.service';
import { TicketProviderService } from '@admin/ticket-provider/ticket-provider.service';
import { TicketTypeService } from '../ticket-type/ticket-type.service';
import { TicketStatus } from '@app/ticket/ticket.types';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketService as CommonTicketService } from '@app/ticket/ticket.service';
import { OutboxService } from '@app/outbox/outbox.service';
import { EventService } from '@app/event/event.service';
import { TicketProviderEncryptionKeyService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.service';

@Injectable()
export class TicketService extends CommonTicketService {
  constructor(
    public readonly ticketRepository: TicketRepository,
    public readonly userService: UserService,
    public readonly ticketProviderService: TicketProviderService,
    public readonly ticketTypeService: TicketTypeService,
    public readonly outboxService: OutboxService,
    public readonly eventService: EventService,
    public readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService,
  ) {
    super(
      ticketRepository,
      userService,
      ticketTypeService,
      ticketProviderService,
      outboxService,
      eventService,
      ticketProviderEncryptionKeyService,
    );
  }

  async retryMinting(retryTicketMintingDto: RetryTicketMinting): Promise<Ticket> {
    const ticket = await this.findById(retryTicketMintingDto.ticketId);
    const ticketProvier = await this.ticketProviderService.findById(retryTicketMintingDto.ticketProviderId);
    const user = await this.userService.findById(retryTicketMintingDto.userId);

    /** @todo create record in outbox table */

    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketValidationDto) {
    const { ticketTypeUuid, ...updateTicketParams } = updateTicketDto;
    await this.ticketRepository.update({ id }, updateTicketParams);

    return this.findById(id);
  }

  async findAllPaginated(searchParams: TicketFilterDto): Promise<PagingResult<Ticket>> {
    return this.ticketRepository.getPaginatedQueryBuilder(searchParams);
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
}
