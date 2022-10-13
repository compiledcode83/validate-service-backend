import { Injectable } from '@nestjs/common';
import { ProducerService } from '@src/producer/producer.service';
import { TicketService } from '@src/ticket/ticket.service';
import { TicketTransferMessage } from '@src/ticket/ticket.types';
import { UserService } from '@src/user/user.service';
import { CreateTicketTransferDto } from './dto/create-ticket-transfer.dto';
import { TicketTransfer } from './ticket-transfer.entity';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { TicketTransferStatus } from './ticket-transfer.types';

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

  async findByUuid(uuid: string): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid } });
  }

  async create(body: CreateTicketTransferDto, ticketProviderId: number): Promise<TicketTransfer> {
    const userTo = await this.userService.findByUuid(body.userUuid);
    const ticket = await this.ticketService.findByUuid(body.ticketUuid, ['user']);
    const entity: Partial<TicketTransfer> = {
      ticketProviderId,
      ticketId: ticket.id,
      userIdFrom: ticket.userId,
      userIdTo: userTo.id,
    };

    const transfer = await this.ticketTransferRepository.save(entity, { reload: false });

    if (transfer) {
      await this.producerService.emit('web3.nft.transfer', {
        transferUuid: transfer.uuid,
        userUuidFrom: ticket.user.uuid,
        userUuidTo: body.userUuid,
        tokenId: ticket.tokenId,
      } as TicketTransferMessage);
    }

    return this.findByUuid(transfer.uuid);
  }

  async complete(uuid: string): Promise<void> {
    await this.ticketTransferRepository.update({ uuid }, { status: TicketTransferStatus.Completed });
  }
}
