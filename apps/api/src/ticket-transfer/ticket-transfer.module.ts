import { Module } from '@nestjs/common';
import { TicketTransferService } from './ticket-transfer.service';
import { TicketTransferController } from './ticket-transfer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@api/user/user.module';
import { TicketModule } from '@api/ticket/ticket.module';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { TicketExistsAndActiveValidator } from './validators/ticket-exists-and-active.validator';
import { TicketTransferReceiverValidator } from './validators/ticket-transfer-receiver.validator';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';
import { OutboxModule } from '@app/outbox/outbox.module';
import { TicketTransferSubscriber } from '@app/ticket-transfer/ticket-transfer.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([TicketTransfer]), UserModule, TicketModule, OutboxModule],
  providers: [
    TicketTransferService,
    TicketTransferRepository,
    TicketExistsAndActiveValidator,
    TicketTransferReceiverValidator,
    TicketTransferSubscriber,
  ],
  controllers: [TicketTransferController],
  exports: [TicketTransferService],
})
export class TicketTransferModule {}
