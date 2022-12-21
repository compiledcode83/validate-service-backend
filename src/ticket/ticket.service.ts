import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { PagingResult } from 'typeorm-cursor-pagination';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';
import { DEFAULT_IMAGE, TicketEventPattern, TicketStatus } from './ticket.types';
import { TicketCreateMessage } from './messages/ticket-create.message';
import { TicketProviderEncryptionKeyService } from '@src/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { TicketProviderSecurityLevel } from '@src/ticket-provider/ticket-provider.types';
import { TicketProvider } from '@src/ticket-provider/ticket-provider.entity';
import { User } from '@src/user/user.entity';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { DeleteTicketDto } from './dto/delete-ticket.dto';
import { TicketDeleteMessage } from './messages/ticket-delete.message';
import { EventService } from '@src/event/event.service';
import { OutboxService } from '@src/outbox/outbox.service';
import { TicketValidateMessage } from './messages/ticket-validate.message';
import { TicketTypeService } from '@src/ticket-type/ticket-type.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userService: UserService,
    private readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService,
    private readonly eventService: EventService,
    private readonly outboxService: OutboxService,
    private readonly ticketTypeService: TicketTypeService,
  ) {}

  async findAllPaginated(searchParams: FindTicketsDto, ticketProviderId: number): Promise<PagingResult<Ticket>> {
    return this.ticketRepository.getPaginatedQueryBuilder(searchParams, ticketProviderId);
  }

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string, relations: string[] = ['user', 'ticketType', 'ticketType.event']): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid }, relations });
  }

  async create(body: CreateTicketDto): Promise<Ticket> {
    const queryRunner = this.ticketRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ticketProvider, user, event, ticketType, ...ticketData } = body;
      const ticketUser = await this.userService.findOrCreate(queryRunner, user);
      const ticketEvent = await this.eventService.findOrCreate(queryRunner, body.event.name, body.ticketProvider.id);
      const ticketTicketType = await this.ticketTypeService.findOrCreate(
        queryRunner,
        ticketEvent.id,
        body.ticketType.name,
        body.ticketType.ticketDateStart,
        body.ticketType?.ticketDateEnd,
      );

      const encryptedUserData = await this.getEncryptedUserData(ticketUser, ticketProvider);
      const createdTicket = await this.ticketRepository.createTicket(
        queryRunner,
        this.ticketRepository.create({
          ...this.ticketRepository.create(ticketData),
          ticketProviderId: ticketProvider.id,
          userId: ticketUser.id,
          imageUrl: body.imageUrl || DEFAULT_IMAGE,
          eventId: ticketEvent.id,
          ticketTypeId: ticketTicketType.id,
        }),
      );

      const ticket = await queryRunner.manager.findOne(Ticket, {
        where: { id: createdTicket.id },
        relations: ['ticketType', 'ticketType.event', 'user'],
      });
      const payload = new TicketCreateMessage({
        ticket,
        user: ticketUser,
        ...encryptedUserData,
      });
      await this.outboxService.create(queryRunner, TicketEventPattern.TicketCreate, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(ticket.uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async validate(body: ValidateTicketDto): Promise<Ticket> {
    const queryRunner = this.ticketRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const ticket = await queryRunner.manager
        .createQueryBuilder(Ticket, 'ticket')
        .setLock('pessimistic_write')
        .where({ uuid: body.ticketUuid, ticketProviderId: body.ticketProvider.id, status: TicketStatus.Active })
        .getOne();

      if (!ticket) {
        throw new BadRequestException('Ticket not found');
      }

      await queryRunner.manager
        .createQueryBuilder(Ticket, 'ticket')
        .update(Ticket)
        .where({ uuid: body.ticketUuid })
        .set({ status: TicketStatus.Validated, validatedAt: new Date() })
        .execute();

      const validatedTicket = await queryRunner.manager.findOneBy(Ticket, { uuid: body.ticketUuid });
      const payload = new TicketValidateMessage({
        ticket: validatedTicket,
      });
      await this.outboxService.create(queryRunner, TicketEventPattern.TicketValidate, payload);
      await queryRunner.commitTransaction();

      return validatedTicket;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(body: DeleteTicketDto): Promise<void> {
    const queryRunner = this.ticketRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager
        .createQueryBuilder(Ticket, 'ticket')
        .update(Ticket)
        .where({ uuid: body.uuid })
        .set({ status: TicketStatus.Deleted, deletedAt: new Date() })
        .execute();

      const deletedTicket = await queryRunner.manager.findOneBy(Ticket, { uuid: body.uuid });
      const payload = new TicketDeleteMessage({
        ticket: deletedTicket,
      });
      await this.outboxService.create(queryRunner, TicketEventPattern.TicketDelete, payload);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
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
