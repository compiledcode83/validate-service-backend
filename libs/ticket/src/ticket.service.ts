/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './ticket.entity';
import { UserService } from '@app/user/user.service';
import { TicketTypeService } from '@app/ticket-type/ticket-type.service';
import { EventService } from '@app/event/event.service';
import { DEFAULT_IMAGE, TicketEventPattern } from './ticket.types';
import { TicketCreateMessage } from './messages/ticket-create.message';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { User } from '@app/user/user.entity';
import { TicketProviderSecurityLevel } from '@app/ticket-provider/ticket-provider.types';
import { TicketProviderEncryptionKeyService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { OutboxService } from '@app/outbox/outbox.service';
import { TicketProviderService } from '@app/ticket-provider/ticket-provider.service';

@Injectable()
export class TicketService {
  constructor(
    public readonly ticketRepository: TicketRepository,
    public readonly userService: UserService,
    public readonly ticketTypeService: TicketTypeService,
    public readonly ticketProviderService: TicketProviderService,
    public readonly outboxService: OutboxService,
    public readonly eventService: EventService,
    public readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService,
  ) {}

  async create(body: CreateTicketDto): Promise<Ticket> {
    const queryRunner = this.ticketRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let { ticketProvider, user, event, ticketType, ...ticketData } = body;
      if (!ticketProvider) {
        ticketProvider = await this.ticketProviderService.findById(body.ticketProviderId);
        user.ticketProvider = ticketProvider;
      }

      const ticketUser = await this.userService.findOrCreate(queryRunner, user);

      const ticketEvent = await this.eventService.findOrCreate(
        queryRunner,
        body.event.name,
        ticketProvider.id,
        body.event.eventUuid,
      );

      const ticketTicketType = await this.ticketTypeService.findOrCreate(
        queryRunner,
        ticketEvent.id,
        body.ticketType.name,
        body.ticketType.ticketDateStart,
        body.ticketType.ticketTypeUuid,
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

    return;
  }

  async findByUuid(uuid: string, relations: string[] = ['user', 'ticketType', 'ticketType.event']): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { uuid }, relations });
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
