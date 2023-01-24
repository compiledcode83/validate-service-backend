import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
import { Message } from '@app/message/message.entity';
import { AppDataSource } from '@app/common/configs/datasource';
import { MessageStatus, MessageType, MessageChannel } from '@app/message/message.types';

export class MessageFactory {
  static async create(data?: Partial<Message>) {
    const message = new Message();
    message.uuid = uuid();
    message.type = MessageType.RedeemCode;
    message.channel = MessageChannel.SMS;
    message.content = faker.random.numeric(6);
    message.status = MessageStatus.Created;

    return AppDataSource.manager.getRepository(Message).save({ ...message, ...data });
  }
}
