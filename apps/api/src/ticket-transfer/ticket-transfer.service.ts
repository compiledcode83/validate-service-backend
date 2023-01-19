import { Injectable } from '@nestjs/common';
import { TicketService } from '@api/ticket/ticket.service';
import { UserService } from '@api/user/user.service';
import { CreateTicketTransferDto } from './dto/create-ticket-transfer.dto';
import { TicketTransfer } from './ticket-transfer.entity';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { TicketTransferEventPattern } from './ticket-transfer.types';
import { TicketTransferMessage } from '@api/ticket-transfer/messages/ticket-transfer.message';
import { OutboxService } from '@api/outbox/outbox.service';

@Injectable()
export class TicketTransferService {
  constructor(
    private readonly ticketTransferRepository: TicketTransferRepository,
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
    private readonly outboxService: OutboxService,
  ) {}

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string, relations: string[] = []): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid }, relations });
  }

  async create(body: CreateTicketTransferDto, ticketProviderId: number): Promise<TicketTransfer> {
    const queryRunner = this.ticketTransferRepository.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const userTo = await this.userService.findByUuid(body.userUuid);
      const ticket = await this.ticketService.findByUuid(body.ticketUuid, ['user']);
      const newTransfer = await queryRunner.manager.save(
        this.ticketTransferRepository.create({
          ticketProviderId,
          ticketId: ticket.id,
          userIdFrom: ticket.userId,
          userIdTo: userTo.id,
        }),
      );
      const transfer = await queryRunner.manager.findOne(TicketTransfer, {
        where: { uuid: newTransfer.uuid },
        relations: ['userFrom', 'userTo', 'ticket'],
      });
      const payload = new TicketTransferMessage({
        transfer,
      });

      await this.outboxService.create(queryRunner, TicketTransferEventPattern.TicketTransfer, payload);
      await queryRunner.commitTransaction();

      return this.findByUuid(transfer.uuid);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async complete(uuid: string, transactionHash: string): Promise<void> {
    await this.ticketTransferRepository.complete(uuid, transactionHash);
  }

  async setError(uuid: string, errorData: string): Promise<void> {
    await this.ticketTransferRepository.update({ uuid }, { errorData });
  }
}
