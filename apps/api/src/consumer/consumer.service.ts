import { Injectable } from '@nestjs/common';
import { TicketTransferService } from '@api/ticket-transfer/ticket-transfer.service';
import { TicketService } from '@api/ticket/ticket.service';
import { UserService } from '@api/user/user.service';
import { TicketDeleteReplyMessage } from './messages/ticket-delete-reply.message';
import { TicketCreateReplyMessage } from './messages/ticket-create-reply.message';
import { TicketTransferReplyMessage } from './messages/ticket-transfer-reply.message';
import { UserCreateReplyMessage } from './messages/user-create-reply.message';

@Injectable()
export class ConsumerService {
  constructor(
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
    private readonly ticketTransferService: TicketTransferService,
  ) {}

  async handleUserCreateReply(message: UserCreateReplyMessage) {
    if (message?.errorData) {
      return this.userService.completeWithError(message.user.uuid, message.errorData);
    }

    await this.userService.completeWithSuccess(message.user.uuid, message.user.walletAddress);
  }

  async handleTicketCreateReply(message: TicketCreateReplyMessage) {
    if (message?.errorData) {
      return this.ticketService.setError(message.ticket.uuid, message.errorData);
    }

    await this.ticketService.activate(
      message.ticket.uuid,
      message.ticket.contractId,
      message.ticket.tokenId,
      message.ticket.ipfsUri,
      message.ticket.transactionHash,
    );
  }

  async handleTicketTransferReply(message: TicketTransferReplyMessage) {
    if (message?.errorData) {
      return this.ticketTransferService.setError(message.transfer.uuid, message.errorData);
    }

    await this.ticketTransferService.complete(message.transfer.uuid, message.transfer.transactionHash);
  }

  async handleTicketDeleteReply(message: TicketDeleteReplyMessage) {
    if (message?.errorData) {
      return this.ticketService.setError(message.ticket.uuid, message.errorData);
    }

    return;
  }
}
