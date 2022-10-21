import { Injectable } from '@nestjs/common';
import { TicketTransferService } from '@src/ticket-transfer/ticket-transfer.service';
import { TicketService } from '@src/ticket/ticket.service';
import { UserService } from '@src/user/user.service';
import { NftBurnReplyMessage } from './messages/nft-burn-reply.message';
import { NftMintReplyMessage } from './messages/nft-mint-reply.message';
import { NftTransferReplyMessage } from './messages/nft-transfer-reply.message';
import { WalletCreateReplyMessage } from './messages/wallet-created-reply.message';

@Injectable()
export class ConsumerService {
  constructor(
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
    private readonly ticketTransferService: TicketTransferService,
  ) {}

  async handleWalletCreateReply(message: WalletCreateReplyMessage) {
    if (message?.errorMessage) {
      return this.userService.completeWithError(message.userUuid, message.errorMessage);
    }

    await this.userService.completeWithSuccess(message.userUuid, message.walletAddress);
  }

  async handleNftMintReply(message: NftMintReplyMessage) {
    if (message?.errorMessage) {
      return this.ticketService.setError(message.ticketUuid, message.errorMessage);
    }

    await this.ticketService.activate(
      message.ticketUuid,
      message.contractAddress,
      message.tokenId,
      message.metadataUri,
      message.transactionHash,
    );
  }

  async handleNftTransferReply(message: NftTransferReplyMessage) {
    if (message?.errorMessage) {
      return this.ticketTransferService.completeWithError(message.transferUuid, message.errorMessage);
    }

    await this.ticketTransferService.completeWithSuccess(message.transferUuid, message.transactionHash);
  }

  async handleNftBurnReply(message: NftBurnReplyMessage) {
    if (message?.errorMessage) {
      return this.ticketService.setError(message.ticketUuid, message.errorMessage);
    }

    return;
  }
}
