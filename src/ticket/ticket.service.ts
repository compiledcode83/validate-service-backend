import { Injectable } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { UserService } from '@src/user/user.service';
import { PagingResult } from 'typeorm-cursor-pagination';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { TicketMintMessage, TicketStatus } from './ticket.types';

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

  async findByUuid(uuid: string, relations?: string[]): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid }, relations });
  }

  async create(body: CreateTicketDto, ticketProviderId: number): Promise<Ticket> {
    const user = await this.userService.findByUuid(body.userUuid);
    const ticketEntity: Partial<Ticket> = {
      ...this.ticketRepository.create(body),
      ticketProviderId,
      userId: user.id,
    };
    const ticket = await this.ticketRepository.save(ticketEntity, { reload: false });

    this.producerService.emit('web3.nft.mint', {
      ticketUuid: ticket.uuid,
      userUuid: user.uuid,
      name: ticket.name,
      description: ticket.name,
      image: 'https://loremflickr.com/cache/resized/65535_51819602222_b063349f16_c_640_480_nofilter.jpg',
      additionalData: ticket.additionalData,
    } as TicketMintMessage);

    return this.findByUuid(ticket.uuid);
  }

  async validate(uuid: string, ticketProviderId: number): Promise<Ticket> {
    return this.ticketRepository.validate(uuid, ticketProviderId);
  }

  async complete(uuid: string, contractId: string, tokenId: number, ipfsUri: string): Promise<void> {
    await this.ticketRepository.update({ uuid }, { contractId, tokenId, ipfsUri, status: TicketStatus.Active });
  }
}
