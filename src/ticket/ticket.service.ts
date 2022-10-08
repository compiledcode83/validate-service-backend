import { Injectable } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { UserService } from '@src/user/user.service';
import { PagingResult } from 'typeorm-cursor-pagination';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userService: UserService,
    private readonly producerService: ProducerService,
  ) {}

  async findAllPaginated(searchParams: FindTicketsDto, ticketProviderId: number): Promise<PagingResult<Ticket>> {
    return this.ticketRepository.getPaginatedQueryBuilder(searchParams, ticketProviderId);
  }

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid } });
  }

  async create(body: CreateTicketDto, ticketProviderId: number): Promise<Ticket> {
    const user = await this.userService.findByUuid(body.userUuid);
    const ticketEntity: Partial<Ticket> = {
      ...this.ticketRepository.create(body),
      ticketProviderId,
      userId: user.id,
    };
    const ticket = await this.ticketRepository.save(ticketEntity, { reload: false });

    this.producerService.emit('web3.nft.mint', { userUuid: user.uuid, ticketUuid: ticket.uuid });

    return this.findByUuid(ticket.uuid);
  }

  async validate(uuid: string, ticketProviderId: number): Promise<Ticket> {
    return this.ticketRepository.validate(uuid, ticketProviderId);
  }
}
