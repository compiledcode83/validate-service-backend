import { Message } from '@app/message/message.entity';
import { MessageSubscriber } from '@app/message/message.subscriber';
import { OutboxModule } from '@app/outbox/outbox.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), OutboxModule],
  providers: [MessageService, MessageRepository, MessageSubscriber],
  exports: [MessageService],
})
export class MessageModule {}
