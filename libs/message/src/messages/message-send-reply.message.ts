import { MessageStatus } from '../message.types';

export class MessageSendReplyMessage {
  operationUuid: string;
  messageUuid: string;
  status: MessageStatus;
  errorData?: string;

  constructor(data: Partial<MessageSendReplyMessage>) {
    Object.assign(this, data);
  }
}
