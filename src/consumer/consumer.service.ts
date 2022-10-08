import { Injectable } from '@nestjs/common';
import { UserService } from '@src/user/user.service';
import { WalletCreatedReplyMessage } from './dto/wallet-created-reply.message';

@Injectable()
export class ConsumerService {
  // constructor(private readonly userService: UserService) {}

  async handleWalletCreateReply(message: WalletCreatedReplyMessage) {
    // await this.userService.updateWallet(message.userUuid, message.walletAddress);
  }
}
