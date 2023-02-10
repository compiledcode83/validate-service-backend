import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '@api/user/user.service';
import { PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { DeleteTicketDto } from './dto/delete-ticket.dto';
import { EventService } from '@api/event/event.service';
import { TicketTypeService } from '@api/ticket-type/ticket-type.service';
import { TicketRepository } from './ticket.repository';
import { TicketProviderEncryptionKeyService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { OutboxService } from '@app/outbox/outbox.service';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketEventPattern, TicketStatus } from '@app/ticket/ticket.types';
import { TicketValidateMessage } from '@app/ticket/messages/ticket-validate.message';
import { TicketDeleteMessage } from '@app/ticket/messages/ticket-delete.message';
import { TicketService as CommonTicketService } from '@app/ticket/ticket.service';
import { TicketProviderService } from '@app/ticket-provider/ticket-provider.service';

@Injectable()
export class TicketService extends CommonTicketService {
  constructor(
    public readonly ticketRepository: TicketRepository,
    public readonly userService: UserService,
    public readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService,
    public readonly eventService: EventService,
    public readonly outboxService: OutboxService,
    public readonly ticketTypeService: TicketTypeService,
    public readonly ticketProviderService: TicketProviderService,
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

  async findAllPaginated(searchParams: FindTicketsDto, ticketProviderId: number): Promise<PagingResult<Ticket>> {
    return this.ticketRepository.getPaginatedQueryBuilder(searchParams, ticketProviderId);
  }

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string, relations: string[] = ['user', 'ticketType', 'ticketType.event']): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid }, relations });
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
}
