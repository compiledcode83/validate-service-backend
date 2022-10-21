export class TicketAdditionalData {
  [key: string]: string | number;
}

export enum TicketStatus {
  Creating = 'creating',
  Active = 'active',
  Validated = 'validated',
}

export enum TicketEventPattern {
  Mint = 'web3.nft.mint',
  MintReply = 'web3.nft.mint.reply',
}
