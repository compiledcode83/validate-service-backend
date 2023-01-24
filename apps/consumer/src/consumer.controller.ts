import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import { TicketDeleteReplyMessage } from './messages/ticket-delete-reply.message';
import { TicketCreateReplyMessage } from './messages/ticket-create-reply.message';
import { TicketTransferReplyMessage } from './messages/ticket-transfer-reply.message';
import { UserCreateReplyMessage } from './messages/user-create-reply.message';
import { UserEventPattern } from '@app/user/user.types';
import { TicketEventPattern } from '@app/ticket/ticket.types';
import { TicketTransferEventPattern } from '@app/ticket-transfer/ticket-transfer.types';
import { MessageEventPattern } from '@app/message/message.types';
import { MessageSendReplyMessage } from '@app/message/messages/message-send-reply.message';
import { PaymentEventPattern } from '@web/payment/payment.types';
import { PaymentCancelPaywallMessage } from '@web/payment/messages/payment-cancel-paywall.message';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);

  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(UserEventPattern.UserCreateReply)
  async handleUserCreateReply(@Payload() message: UserCreateReplyMessage) {
    await this.consumerService.handleUserCreateReply(message);
    this.logger.log(`Updated wallet for user ${message.user.uuid}: ${message.user.walletAddress}`);
  }

  @EventPattern(TicketEventPattern.TicketCreateReply)
  async handleTicketCreateReply(@Payload() message: TicketCreateReplyMessage) {
    await this.consumerService.handleTicketCreateReply(message);
    this.logger.log(`Updated nft data for ticket ${message.ticket.uuid}`);
  }

  @EventPattern(TicketTransferEventPattern.TicketTransferReply)
  async handleTicketTransferReply(@Payload() message: TicketTransferReplyMessage) {
    await this.consumerService.handleTicketTransferReply(message);
    this.logger.log(`Updated nft transfer data for transfer ${message.transfer.uuid}`);
  }

  @EventPattern(TicketEventPattern.TicketDeleteReply)
  async handleTicketDeleteReply(@Payload() message: TicketDeleteReplyMessage) {
    await this.consumerService.handleTicketDeleteReply(message);
    this.logger.log(`Saved nft burn data for ticket ${message.ticket.uuid}`);
  }

  @EventPattern(MessageEventPattern.SendReply)
  async handleMessageSendReply(@Payload() message: MessageSendReplyMessage) {
    await this.consumerService.handleMessageSendReply(message);
    this.logger.log(`Handled ${MessageEventPattern.SendReply} for message ${message.messageUuid}`);
  }

  @EventPattern(PaymentEventPattern.CancelPaywall)
  async handlePaymentPaywallCancel(@Payload() message: PaymentCancelPaywallMessage) {
    await this.consumerService.handlePaymentPaywallCancel(message);
    this.logger.log(`Handled ${PaymentEventPattern.CancelPaywall} for order ${message.order.uuid}`);
  }
}
