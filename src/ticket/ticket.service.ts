import { Injectable } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { UserService } from '@src/user/user.service';
import { PagingResult } from 'typeorm-cursor-pagination';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { TicketEventPattern, TicketStatus } from './ticket.types';
import { TicketMintMessage } from './messages/ticket-mint.message';
import { TicketProviderEncryptionKeyService } from '@src/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { TicketProviderSecurityLevel } from '@src/ticket-provider/ticket-provider.types';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { User } from '@src/user/user.entity';
import { ValidateTicketDto } from './dto/validate-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userService: UserService,
    private readonly producerService: ProducerService,
    private readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService,
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

  async create(body: CreateTicketDto): Promise<Ticket> {
    const user = await this.userService.findByUuid(body.userUuid);
    const { ticketProvider } = body;
    const encryptedUserData = await this.getEncryptedUserData(user, ticketProvider);
    const ticket = await this.ticketRepository.save(
      {
        ...this.ticketRepository.create(body),
        ticketProviderId: ticketProvider.id,
        userId: user.id,
      },
      { reload: false },
    );

    await this.producerService.emit(
      TicketEventPattern.Mint,
      new TicketMintMessage({
        ticketUuid: ticket.uuid,
        userUuid: user.uuid,
        name: ticket.name,
        description: ticket.name,
        image: 'https://loremflickr.com/cache/resized/65535_51819602222_b063349f16_c_640_480_nofilter.jpg',
        additionalData: ticket.additionalData,
        ...encryptedUserData,
      }),
    );

    return this.findByUuid(ticket.uuid);
  }

  async validate(body: ValidateTicketDto): Promise<Ticket> {
    return this.ticketRepository.validate(body.uuid, body.ticketProvider.id);
  }

  async completeWithSuccess(
    uuid: string,
    contractId: string,
    tokenId: number,
    ipfsUri: string,
    transactionHash: string,
  ): Promise<void> {
    await this.ticketRepository.update(
      { uuid },
      { contractId, tokenId, ipfsUri, status: TicketStatus.Active, transactionHash },
    );
  }

  async completeWithError(uuid: string, errorData: string): Promise<void> {
    await this.ticketRepository.update({ uuid }, { errorData });
  }

  private async getEncryptedUserData(
    user: User,
    ticketProvider: TicketProvider,
  ): Promise<Pick<TicketMintMessage, 'user'>> {
    if (ticketProvider.securityLevel !== TicketProviderSecurityLevel.Level2) {
      return;
    }

    return {
      user: await this.ticketProviderEncryptionKeyService.encryptTicketUserData(user),
    };
  }
}
