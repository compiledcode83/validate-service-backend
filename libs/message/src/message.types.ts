import { PaginatedResultCursor } from '@app/common/pagination/pagination.types';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.entity';

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

export class MessagePaginatedResult {
  @ApiProperty({ isArray: true, type: () => Message })
  data: Message[];

  @ApiProperty()
  cursor: PaginatedResultCursor;
}
