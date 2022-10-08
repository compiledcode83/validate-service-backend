import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ConsumerService } from './consumer.service';
import { WalletCreatedReplyMessage } from './dto/wallet-created-reply.message';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);

  constructor(private readonly consumerService: ConsumerService) {}

  @EventPattern('web3.wallet.create.reply')
  async handleWalletCreateReply(@Payload() message: WalletCreatedReplyMessage) {
    this.consumerService.handleWalletCreateReply(message);
    this.logger.log(`Updated wallet for user ${message.userUuid}: ${message.walletAddress}`);
  }
}
