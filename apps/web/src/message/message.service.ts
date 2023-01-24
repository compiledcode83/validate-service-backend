import { Message } from '@app/message/message.entity';
import { MessageType, MessageChannel, MessageEventPattern, MessageStatus } from '@app/message/message.types';
import { MessageSendMessage } from '@app/message/messages/message-send.message';
import { OutboxService } from '@app/outbox/outbox.service';
import { Redeem } from '@app/redeem/redeem.entity';
import { User } from '@app/user/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'node:crypto';
import { QueryRunner } from 'typeorm';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly configService: ConfigService,
    private readonly outboxService: OutboxService,
  ) {}

  async findByUuid(uuid: string): Promise<Message> {
    return this.messageRepository.findOneBy({ uuid });
  }

  async createTicketsPurchaseMessages(queryRunner: QueryRunner, purchaseId: string, user: User): Promise<void> {
    const link = `https://${this.configService.get('appConfig.ticketDomain')}/${purchaseId}`;

    for (const channel of Object.values(MessageChannel)) {
      const content = channel === MessageChannel.Email ? link : `Your tickets link ${link}`;
      const sendTo = channel === MessageChannel.SMS ? user.phoneNumber : user.email;

      const message = await queryRunner.manager.save(
        this.messageRepository.create({
          purchaseId,
          type: MessageType.TicketLink,
          channel,
          content,
          sendTo,
        }),
      );

      const payload = new MessageSendMessage({
        messageUuid: message.uuid,
        type: MessageType.TicketLink,
        channel,
        content,
        sendTo,
      });

      await this.outboxService.create(queryRunner, MessageEventPattern.Send, payload);
    }
  }

  async createRedeemCodes(queryRunner: QueryRunner, redeem: Redeem): Promise<void> {
    const code = String(
      randomInt(
        this.configService.get('redeemConfig.redeemVerifyCodeMin'),
        this.configService.get('redeemConfig.redeemVerifyCodeMax'),
      ),
    );

    const message = await queryRunner.manager.save(
      this.messageRepository.create({
        redeemId: redeem.id,
        purchaseId: redeem.purchaseId,
        type: MessageType.RedeemCode,
        channel: MessageChannel.SMS,
        content: code,
        sendTo: redeem.user.phoneNumber,
        status: MessageStatus.Created,
      }),
    );

    const payload = new MessageSendMessage({
      messageUuid: message.uuid,
      type: message.type,
      channel: message.channel,
      content: `Your redeem code is ${code}`,
      sendTo: redeem.user.phoneNumber,
    });

    await this.outboxService.create(queryRunner, MessageEventPattern.Send, payload);
  }

  async createAuthCodes(queryRunner: QueryRunner, authCode: number, user: User): Promise<void> {
    const message = await queryRunner.manager.save(
      this.messageRepository.create({
        type: MessageType.AuthCode,
        channel: MessageChannel.SMS,
        content: String(authCode),
        sendTo: user.phoneNumber,
        status: MessageStatus.Created,
        userId: user.id,
      }),
    );

    const payload = new MessageSendMessage({
      messageUuid: message.uuid,
      type: message.type,
      channel: message.channel,
      content: `Your auth code is ${authCode}`,
      sendTo: user.phoneNumber,
    });

    await this.outboxService.create(queryRunner, MessageEventPattern.Send, payload);
  }

  async update(uuid: string, data: Partial<Message>): Promise<Message> {
    await this.messageRepository.update({ uuid }, data);

    return this.findByUuid(uuid);
  }

  async setError(uuid: string, errorData: string): Promise<void> {
    await this.messageRepository.update({ uuid }, { errorData, status: MessageStatus.Error });
  }
}
