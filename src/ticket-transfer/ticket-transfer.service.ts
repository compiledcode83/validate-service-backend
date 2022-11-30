import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { TicketService } from '@src/ticket/ticket.service';
import { UserService } from '@src/user/user.service';
import { CreateTicketTransferDto } from './dto/create-ticket-transfer.dto';
import { TicketTransfer } from './ticket-transfer.entity';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { TicketTransferEventPattern } from './ticket-transfer.types';
import { TicketTransferMessage } from '@src/ticket-transfer/messages/ticket-transfer.message';

@Injectable()
export class TicketTransferService {
  constructor(
    private readonly ticketTransferRepository: TicketTransferRepository,
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
    private readonly producerService: ProducerService,
  ) {}

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string, relations: string[] = []): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid }, relations });
  }

  async create(body: CreateTicketTransferDto, ticketProviderId: number): Promise<TicketTransfer> {
    try {
      const userTo = await this.userService.findByUuid(body.userUuid);
      const ticket = await this.ticketService.findByUuid(body.ticketUuid, ['user']);
      const newTransfer = await this.ticketTransferRepository.save(
        this.ticketTransferRepository.create({
          ticketProviderId,
          ticketId: ticket.id,
          userIdFrom: ticket.userId,
          userIdTo: userTo.id,
        }),
      );
      const transfer = await this.findByUuid(newTransfer.uuid, ['userFrom', 'userTo', 'ticket']);

      await this.producerService.emit(
        TicketTransferEventPattern.TicketTransfer,
        new TicketTransferMessage({
          transfer,
        }),
      );

      return this.findByUuid(transfer.uuid);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async complete(uuid: string, transactionHash: string): Promise<void> {
    await this.ticketTransferRepository.complete(uuid, transactionHash);
  }

  async setError(uuid: string, errorData: string): Promise<void> {
    await this.ticketTransferRepository.update({ uuid }, { errorData });
  }
}
