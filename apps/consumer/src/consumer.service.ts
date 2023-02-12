import { Injectable, Logger } from '@nestjs/common';
import { TicketTransferService } from '@api/ticket-transfer/ticket-transfer.service';
import { TicketDeleteReplyMessage } from './messages/ticket-delete-reply.message';
import { TicketCreateReplyMessage } from './messages/ticket-create-reply.message';
import { TicketTransferReplyMessage } from './messages/ticket-transfer-reply.message';
import { UserCreateReplyMessage } from './messages/user-create-reply.message';
import { OrderService } from '@web/order/order.service';
import { MessageSendReplyMessage } from '@app/message/messages/message-send-reply.message';
import { InboxService } from '@app/inbox/inbox.service';
import { PaymentService } from '@web/payment/payment.service';
import { MessageService } from '@web/message/message.service';
import { PaymentCancelPaywallMessage } from '@web/payment/messages/payment-cancel-paywall.message';
import { PaymentProviderType } from '@web/payment/payment.types';
import { TicketService } from '@app/ticket/ticket.service';
import { UserService } from '@app/user/user.service';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);

  constructor(
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
    private readonly ticketTransferService: TicketTransferService,
    private readonly orderService: OrderService,
    private readonly inboxService: InboxService,
    private readonly paymentService: PaymentService,
    private readonly messageService: MessageService,
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

    const order = await this.orderService.findByTicketId(message.ticket.id);

    if (order) {
      await this.orderService.completeOrder(order.id);
    }
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

  async handleMessageSendReply(message: MessageSendReplyMessage) {
    const startedOperation = await this.inboxService.startOperation(message.operationUuid);

    if (!startedOperation) {
      return this.logger.warn(`Operation ${message.operationUuid} is already processed`);
    }

    if (message?.errorData) {
      return this.messageService.setError(message.messageUuid, message.errorData);
    }

    await this.messageService.update(message.messageUuid, { status: message.status });
  }

  async handlePaymentPaywallCancel(message: PaymentCancelPaywallMessage) {
    const startedOperation = await this.inboxService.startOperation(message.operationUuid);

    if (!startedOperation) {
      return this.logger.warn(`Operation ${message.operationUuid} is already processed`);
    }

    await this.paymentService.cancel(message.order.uuid, PaymentProviderType.Stripe);
  }
}
