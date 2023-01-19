import { Module } from '@nestjs/common';
import { TicketTransferService } from './ticket-transfer.service';
import { TicketTransferController } from './ticket-transfer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTransfer } from './ticket-transfer.entity';
import { UserModule } from '@api/user/user.module';
import { TicketModule } from '@api/ticket/ticket.module';
import { TicketTransferRepository } from './ticket-transfer.repository';
import { TicketExistsAndActiveValidator } from './validators/ticket-exists-and-active.validator';
import { TicketTransferReceiverValidator } from './validators/ticket-transfer-receiver.validator';
import { OutboxModule } from '@api/outbox/outbox.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketTransfer]), UserModule, TicketModule, OutboxModule],
  providers: [
    TicketTransferService,
    TicketTransferRepository,
    TicketExistsAndActiveValidator,
    TicketTransferReceiverValidator,
  ],
  controllers: [TicketTransferController],
  exports: [TicketTransferService],
})
export class TicketTransferModule {}
