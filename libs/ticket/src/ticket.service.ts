import { Injectable } from '@nestjs/common';
import { TicketProviderSecurityLevel } from '@app/ticket-provider/ticket-provider.types';
import { Ticket } from '@app/ticket/ticket.entity';
import { DEFAULT_IMAGE, TicketEventPattern, TicketStatus } from '@app/ticket/ticket.types';
import { TicketCreateMessage } from '@app/ticket/messages/ticket-create.message';
import { TicketRepository } from './ticket.repository';
import { OutboxService } from '@app/outbox/outbox.service';
import { TicketProviderEncryptionKeyService } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.service';
import { User } from '@app/user/user.entity';
import { TicketProvider } from '@app/ticket-provider/ticket-provider.entity';
import { EventService } from '@app/event/event.service';
import { TicketTypeService } from '@app/ticket-type/ticket-type.service';
import { UserService } from '@app/user/user.service';
import { Event } from '@app/event/event.entity';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { Locale } from '@app/translation/translation.types';
import { TranslationService } from '@app/translation/translation.service';

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

  async create(
    ticketProvider: Pick<TicketProvider, 'securityLevel' | 'id'>,
    user: Partial<User>,
    event: Partial<Event>,
    ticketType: Partial<TicketType>,
    ticketData: Partial<Ticket>,
    locale: Locale,
  ): Promise<Ticket> {
    const queryRunner = this.ticketRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const ticketUser = await this.userService.findOrCreate(queryRunner, user, ticketProvider.id);
      const ticketEvent = await this.eventService.findOrCreate(queryRunner, event, ticketProvider.id, locale);
      const ticketTicketType = await this.ticketTypeService.findOrCreate(
        queryRunner,
        ticketEvent.id,
        ticketProvider.id,
        ticketType,
        locale,
      );

      const encryptedUserData = await this.getEncryptedUserData(ticketUser, ticketProvider);
      const createdTicket = await this.ticketRepository.createTicket(
        queryRunner,
        this.ticketRepository.create({
          ...this.ticketRepository.create(ticketData),
          ticketProviderId: ticketProvider.id,
          userId: ticketUser.id,
          imageUrl: ticketData.imageUrl || DEFAULT_IMAGE,
          eventId: ticketEvent.id,
          ticketTypeId: ticketTicketType.id,
        }),
      );

      const ticket = await queryRunner.manager.findOne(Ticket, {
        where: { id: createdTicket.id },
        relations: [
          'ticketType',
          'ticketType.event',
          'ticketType.translations',
          'ticketType.event.translations',
          'user',
        ],
      });

      TranslationService.mapEntity(ticket.ticketType, locale);
      TranslationService.mapEntity(ticket.ticketType.event, locale);

      const payload = new TicketCreateMessage({
        ticket,
        user: ticketUser,
        ...encryptedUserData,
      });
      await this.outboxService.create(queryRunner, TicketEventPattern.TicketCreate, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(ticket.uuid, locale);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByUuid(uuid: string, locale: Locale): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { uuid },
      relations: ['user', 'ticketType', 'ticketType.event', 'ticketType.translations', 'ticketType.event.translations'],
    });

    TranslationService.mapEntity(ticket.ticketType, locale);
    TranslationService.mapEntity(ticket.ticketType.event, locale);

    return ticket;
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
    ticketProvider: Pick<TicketProvider, 'securityLevel'>,
  ): Promise<Pick<TicketCreateMessage, 'encryptedData'>> {
    if (ticketProvider.securityLevel !== TicketProviderSecurityLevel.Level2) {
      return;
    }

    return {
      encryptedData: await this.ticketProviderEncryptionKeyService.encryptTicketUserData(user),
    };
  }
}
