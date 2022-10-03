import { Injectable } from '@nestjs/common';
import { TicketService } from '@src/ticket/ticket.service';
import { UserService } from '@src/user/user.service';
import { CreateTicketTransferDto } from './dto/create-ticket-transfer.dto';
import { TicketTransfer } from './ticket-transfer.entity';
import { TicketTransferRepository } from './ticket-transfer.repository';

@Injectable()
export class TicketTransferService {
  constructor(
    private readonly ticketTransferRepository: TicketTransferRepository,
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
  ) {}

  async findByUuidAndProvider(uuid: string, ticketProviderId: number): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid, ticketProviderId } });
  }

  async findByUuid(uuid: string): Promise<TicketTransfer> {
    return this.ticketTransferRepository.findOne({ where: { uuid } });
  }

  async create(body: CreateTicketTransferDto, ticketProviderId: number): Promise<TicketTransfer> {
    const userTo = await this.userService.findByUuid(body.userUuid);
    const ticket = await this.ticketService.findByUuid(body.ticketUuid);
    const entity: Partial<TicketTransfer> = {
      ticketProviderId,
      ticketId: ticket.id,
      userIdFrom: ticket.userId,
      userIdTo: userTo.id,
    };

    const transfer = await this.ticketTransferRepository.save(entity, { reload: false });

    return this.findByUuid(transfer.uuid);
  }
}
