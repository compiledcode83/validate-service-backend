import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import { NftMintReplyMessage } from './messages/nft-mint-reply.message';
import { NftTransferReplyMessage } from './messages/nft-transfer-reply.message';
import { WalletCreateReplyMessage } from './messages/wallet-created-reply.message';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);

  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern('web3.wallet.create.reply')
  async handleWalletCreateReply(@Payload() message: WalletCreateReplyMessage) {
    this.consumerService.handleWalletCreateReply(message);
    this.logger.log(`Updated wallet for user ${message.userUuid}: ${message.walletAddress}`);
  }

  @EventPattern('web3.nft.mint.reply')
  async handleNftMintReply(@Payload() message: NftMintReplyMessage) {
    this.consumerService.handleNftMintReply(message);
    this.logger.log(`Updated nft data for ticket ${message.ticketUuid}`);
  }

  @EventPattern('web3.nft.transfer.reply')
  async handleNftTransferReply(@Payload() message: NftTransferReplyMessage) {
    this.consumerService.handleNftTransferReply(message);
    this.logger.log(`Updated nft transfer data for transfer ${message.transferUuid}`);
  }
}
