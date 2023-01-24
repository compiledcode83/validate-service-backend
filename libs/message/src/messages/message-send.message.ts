import { v4 as uuid } from 'uuid';
import { MessageChannel, MessageType } from '../message.types';

export class MessageSendMessage {
  operationUuid: string;
  messageUuid: string;
  type: MessageType;
  channel: MessageChannel;
  content: string;
  sendTo: string;

  constructor(data: Partial<MessageSendMessage>) {
    Object.assign(this, data);
    this.operationUuid = uuid();
  }

  toString() {
    return JSON.stringify(this);
  }
}
