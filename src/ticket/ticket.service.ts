import { Injectable } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { UserService } from '@src/user/user.service';
import { PagingResult } from 'typeorm-cursor-pagination';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { TicketEventPattern, TicketStatus } from './ticket.types';
import { TicketCreateMessage } from './messages/ticket-create.message';
import { TicketProviderEncryptionKeyService } from '@src/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { TicketProviderSecurityLevel } from '@src/ticket-provider/ticket-provider.types';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { User } from '@src/user/user.entity';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { DeleteTicketDto } from './dto/delete-ticket.dto';
import { TicketDeleteMessage } from './messages/ticket-delete.message';
import { EventService } from '@src/event/event.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userService: UserService,
    private readonly producerService: ProducerService,
    private readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService,
    private readonly eventService: EventService,
    private readonly configService: ConfigService,
  ) {}

  async findAllPaginated(searchParams: FindTicketsDto, ticketProviderId: number): Promise<PagingResult<Ticket>> {
    return this.ticketRepository.getPaginatedQueryBuilder(searchParams, ticketProviderId);
  }

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string, relations: string[] = ['user']): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid }, relations });
  }

  async create(body: CreateTicketDto): Promise<Ticket> {
    const { ticketProvider, user, ...ticketData } = body;
    const ticketUser = await this.userService.findOrCreate(user);
    const encryptedUserData = await this.getEncryptedUserData(ticketUser, ticketProvider);
    const ticket = await this.ticketRepository.save(
      {
        ...this.ticketRepository.create(ticketData),
        ticketProviderId: ticketProvider.id,
        userId: ticketUser.id,
        imageUrl:
          body.imageUrl || 'https://loremflickr.com/cache/resized/65535_51819602222_b063349f16_c_640_480_nofilter.jpg',
      },
      { reload: false },
    );

    await this.eventService.createOrInsert(ticket.name, ticket.type, ticket.ticketProviderId);

    const savedTicket = await this.findByUuid(ticket.uuid);

    await this.producerService.emit(
      TicketEventPattern.TicketCreate,
      new TicketCreateMessage({
        ticket: savedTicket,
        user: ticketUser,
        ...encryptedUserData,
      }),
    );

    return savedTicket;
  }

  async validate(body: ValidateTicketDto): Promise<Ticket> {
    return this.ticketRepository.validate(body.ticketUuid, body.ticketProvider.id);
  }

  async delete(body: DeleteTicketDto): Promise<void> {
    await this.ticketRepository.update({ uuid: body.uuid }, { status: TicketStatus.Deleted, deletedAt: new Date() });

    const ticket = await this.findByUuid(body.uuid);

    await this.producerService.emit(
      TicketEventPattern.TicketDelete,
      new TicketDeleteMessage({
        ticket,
      }),
    );
  }

  async activate(
    uuid: string,
    contractId: string,
    tokenId: number,
    ipfsUri: string,
    transactionHash: string,
  ): Promise<void> {
    await this.ticketRepository.update(
      { uuid },
      { contractId, tokenId, ipfsUri, status: TicketStatus.Active, transactionHash, errorData: null },
    );
  }

  async setError(uuid: string, errorData: string): Promise<void> {
    await this.ticketRepository.update({ uuid }, { errorData });
  }

  private async getEncryptedUserData(
    user: User,
    ticketProvider: TicketProvider,
  ): Promise<Pick<TicketCreateMessage, 'encryptedData'>> {
    if (ticketProvider.securityLevel !== TicketProviderSecurityLevel.Level2) {
      return;
    }

    return {
      encryptedData: await this.ticketProviderEncryptionKeyService.encryptTicketUserData(user),
    };
  }
}
