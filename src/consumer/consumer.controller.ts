import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import { Web3EventPattern } from './consumer.types';
import { TicketDeleteReplyMessage } from './messages/ticket-delete-reply.message';
import { TicketCreateReplyMessage } from './messages/ticket-create-reply.message';
import { TicketTransferReplyMessage } from './messages/ticket-transfer-reply.message';
import { UserCreateReplyMessage } from './messages/user-create-reply.message';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);

  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(Web3EventPattern.WalletCreateReply)
  async handleWalletCreateReply(@Payload() message: UserCreateReplyMessage) {
    this.consumerService.handleUserCreateReply(message);
    this.logger.log(`Updated wallet for user ${message.user.uuid}: ${message.user.walletAddress}`);
  }

  @EventPattern(Web3EventPattern.NftMintReply)
  async handleNftMintReply(@Payload() message: TicketCreateReplyMessage) {
    this.consumerService.handleTicketCreateReply(message);
    this.logger.log(`Updated nft data for ticket ${message.ticket.uuid}`);
  }

  @EventPattern(Web3EventPattern.NftTransferReply)
  async handleNftTransferReply(@Payload() message: TicketTransferReplyMessage) {
    this.consumerService.handleTicketTransferReply(message);
    this.logger.log(`Updated nft transfer data for transfer ${message.transferUuid}`);
  }

  @EventPattern(Web3EventPattern.NftBurnReply)
  async handleNftBurnReply(@Payload() message: TicketDeleteReplyMessage) {
    this.consumerService.handleTicketDeleteReply(message);
    this.logger.log(`Saved nft burn data for ticket ${message.ticketUuid}`);
  }
}
