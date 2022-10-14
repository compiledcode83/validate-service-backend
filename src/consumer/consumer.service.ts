import { Injectable } from '@nestjs/common';
import { TicketTransferService } from '@src/ticket-transfer/ticket-transfer.service';
import { TicketService } from '@src/ticket/ticket.service';
import { UserService } from '@src/user/user.service';
import { NftMintReplyMessage } from './dto/nft-mint-reply.message';
import { NftTransferReplyMessage } from './dto/nft-transfer-reply.message';
import { WalletCreateReplyMessage } from './dto/wallet-created-reply.message';

@Injectable()
export class ConsumerService {
  constructor(
    private readonly userService: UserService,
    private readonly ticketService: TicketService,
    private readonly ticketTransferService: TicketTransferService,
  ) {}

  async handleWalletCreateReply(message: WalletCreateReplyMessage) {
    await this.userService.complete(message.userUuid, message.walletAddress);
  }

  async handleNftMintReply(message: NftMintReplyMessage) {
    await this.ticketService.complete(
      message.ticketUuid,
      message.contractAddress,
      message.tokenId,
      message.metadataUri,
      message.transactionHash,
    );
  }

  async handleNftTransferReply(message: NftTransferReplyMessage) {
    await this.ticketTransferService.complete(message.transferUuid, message.transactionHash);
  }
}
