export enum MessageType {
  TicketLink = 'ticketLink',
  RedeemCode = 'redeemCode',
  AuthCode = 'authCode',
}

export enum MessageChannel {
  SMS = 'sms',
  Email = 'email',
}

export enum MessageStatus {
  Created = 'created',
  Sent = 'sent',
  Delivered = 'delivered',
  Error = 'error',
}

export enum MessageEventPattern {
  Send = 'message.send',
  SendReply = 'message.send.reply',
}
