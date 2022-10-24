import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import { Web3EventPattern } from './consumer.types';
import { NftBurnReplyMessage } from './messages/nft-burn-reply.message';
import { NftMintReplyMessage } from './messages/nft-mint-reply.message';
import { NftTransferReplyMessage } from './messages/nft-transfer-reply.message';
import { WalletCreateReplyMessage } from './messages/wallet-created-reply.message';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);

  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern(Web3EventPattern.WalletCreateReply)
  async handleWalletCreateReply(@Payload() message: WalletCreateReplyMessage) {
    this.consumerService.handleWalletCreateReply(message);
    this.logger.log(`Updated wallet for user ${message.userUuid}: ${message.walletAddress}`);
  }

  @EventPattern(Web3EventPattern.NftMintReply)
  async handleNftMintReply(@Payload() message: NftMintReplyMessage) {
    this.consumerService.handleNftMintReply(message);
    this.logger.log(`Updated nft data for ticket ${message.ticketUuid}`);
  }

  @EventPattern(Web3EventPattern.NftTransferReply)
  async handleNftTransferReply(@Payload() message: NftTransferReplyMessage) {
    this.consumerService.handleNftTransferReply(message);
    this.logger.log(`Updated nft transfer data for transfer ${message.transferUuid}`);
  }

  @EventPattern(Web3EventPattern.NftBurnReply)
  async handleNftBurnReply(@Payload() message: NftBurnReplyMessage) {
    this.consumerService.handleNftBurnReply(message);
    this.logger.log(`Saved nft burn data for ticket ${message.ticketUuid}`);
  }
}
