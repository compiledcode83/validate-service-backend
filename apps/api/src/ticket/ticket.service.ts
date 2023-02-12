import { BadRequestException, Injectable } from '@nestjs/common';
import { PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { DeleteTicketDto } from './dto/delete-ticket.dto';
import { TicketRepository } from './ticket.repository';
import { OutboxService } from '@app/outbox/outbox.service';
import { Ticket } from '@app/ticket/ticket.entity';
import { TicketEventPattern, TicketStatus } from '@app/ticket/ticket.types';
import { TicketValidateMessage } from '@app/ticket/messages/ticket-validate.message';
import { TicketDeleteMessage } from '@app/ticket/messages/ticket-delete.message';
import { TicketService as CommonTicketService } from '@app/ticket/ticket.service';
import { CreateTicketDto } from '@app/ticket/dto/create-ticket.dto';
import { Locale } from '@app/translation/translation.types';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly outboxService: OutboxService,
    private readonly commonTicketService: CommonTicketService,
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

  async create(body: CreateTicketDto, locale: Locale): Promise<Ticket> {
    const { ticketProvider, user, event, ticketType, ...ticketData } = body;

    return this.commonTicketService.create(ticketProvider, user, event, ticketType, ticketData, locale);
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
}
