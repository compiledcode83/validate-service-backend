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

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userService: UserService,
    private readonly ticketProviderService: TicketProviderService,
    private readonly ticketTypeService: TicketTypeService,
  ) {}

  async create(createTicketDto: CreateTicketValidationDto) {
    const { user, ...ticketData } = createTicketDto;
    const newCreatedUser = await this.userService.findOrCreate(user, ticketData.ticketProviderId);
    const ticketProvider = await this.ticketProviderService.findById(createTicketDto.ticketProviderId);
    const ticketType = await this.ticketTypeService.findByUuid(ticketData.ticketTypeUuid);

    const ticket = await this.ticketRepository.save({
      ...createTicketDto,
      user: newCreatedUser,
      eventId: ticketData.eventId,
      ticketProviderId: ticketProvider.id,
      ticketTypeId: ticketType.id,
      imageUrl:
        createTicketDto.imageUrl ||
        'https://loremflickr.com/cache/resized/65535_51819602222_b063349f16_c_640_480_nofilter.jpg',
    });

    const savedTicket = await this.findById(ticket.id);

    /** @todo create record in outbox table */

    return ticket;
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
